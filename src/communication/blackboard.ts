import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

export interface BlackboardEntry {
  id: string;
  key: string;
  value: any;
  author: string;
  timestamp: Date;
  version: number;
  tags?: string[];
  expiresAt?: Date;
}

export interface BlackboardQuery {
  key?: string | RegExp;
  author?: string;
  tags?: string[];
  after?: Date;
  before?: Date;
  limit?: number;
}

export class Blackboard extends EventEmitter {
  private entries: Map<string, BlackboardEntry[]> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  private logger: winston.Logger;
  private maxHistoryPerKey: number;
  
  constructor(maxHistoryPerKey: number = 10) {
    super();
    this.maxHistoryPerKey = maxHistoryPerKey;
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [Blackboard] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/blackboard.log' }),
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
      ],
    });
    
    this.startCleanupTask();
  }
  
  public write(key: string, value: any, author: string, tags?: string[], ttl?: number): string {
    const id = uuidv4();
    const timestamp = new Date();
    const expiresAt = ttl ? new Date(timestamp.getTime() + ttl) : undefined;
    
    const history = this.entries.get(key) || [];
    const version = history.length > 0 ? history[history.length - 1].version + 1 : 1;
    
    const entry: BlackboardEntry = {
      id,
      key,
      value,
      author,
      timestamp,
      version,
      tags,
      expiresAt,
    };
    
    history.push(entry);
    
    if (history.length > this.maxHistoryPerKey) {
      history.shift();
    }
    
    this.entries.set(key, history);
    
    this.logger.info('Entry written', { 
      key, 
      author, 
      version,
      tags,
      valueType: typeof value 
    });
    
    this.emit('write', entry);
    
    this.notifySubscribers(key, entry);
    
    return id;
  }
  
  public read(key: string): BlackboardEntry | undefined {
    const history = this.entries.get(key);
    if (!history || history.length === 0) {
      return undefined;
    }
    
    const latest = history[history.length - 1];
    
    if (latest.expiresAt && latest.expiresAt < new Date()) {
      this.logger.debug('Entry expired', { key, expiresAt: latest.expiresAt });
      return undefined;
    }
    
    return latest;
  }
  
  public readHistory(key: string, limit?: number): BlackboardEntry[] {
    const history = this.entries.get(key) || [];
    const validHistory = history.filter(entry => 
      !entry.expiresAt || entry.expiresAt >= new Date()
    );
    
    if (limit) {
      return validHistory.slice(-limit);
    }
    
    return validHistory;
  }
  
  public query(query: BlackboardQuery): BlackboardEntry[] {
    const results: BlackboardEntry[] = [];
    
    for (const [key, history] of this.entries) {
      if (query.key) {
        if (query.key instanceof RegExp) {
          if (!query.key.test(key)) continue;
        } else {
          if (key !== query.key) continue;
        }
      }
      
      for (const entry of history) {
        if (entry.expiresAt && entry.expiresAt < new Date()) {
          continue;
        }
        
        if (query.author && entry.author !== query.author) {
          continue;
        }
        
        if (query.tags && query.tags.length > 0) {
          if (!entry.tags || !query.tags.every(tag => entry.tags!.includes(tag))) {
            continue;
          }
        }
        
        if (query.after && entry.timestamp < query.after) {
          continue;
        }
        
        if (query.before && entry.timestamp > query.before) {
          continue;
        }
        
        results.push(entry);
      }
    }
    
    results.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (query.limit) {
      return results.slice(-query.limit);
    }
    
    return results;
  }
  
  public subscribe(key: string, agentId: string): void {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    
    this.subscriptions.get(key)!.add(agentId);
    
    this.logger.debug('Subscription added', { key, agentId });
  }
  
  public unsubscribe(key: string, agentId: string): void {
    const subscribers = this.subscriptions.get(key);
    if (subscribers) {
      subscribers.delete(agentId);
      
      if (subscribers.size === 0) {
        this.subscriptions.delete(key);
      }
    }
    
    this.logger.debug('Subscription removed', { key, agentId });
  }
  
  public delete(key: string): boolean {
    const existed = this.entries.has(key);
    this.entries.delete(key);
    
    if (existed) {
      this.logger.info('Entry deleted', { key });
      this.emit('delete', { key });
    }
    
    return existed;
  }
  
  public clear(): void {
    const count = this.entries.size;
    this.entries.clear();
    this.subscriptions.clear();
    
    this.logger.info('Blackboard cleared', { entriesCleared: count });
    this.emit('clear');
  }
  
  private notifySubscribers(key: string, entry: BlackboardEntry): void {
    const subscribers = this.subscriptions.get(key);
    if (!subscribers || subscribers.size === 0) {
      return;
    }
    
    for (const agentId of subscribers) {
      this.emit(`update:${agentId}`, entry);
    }
    
    this.logger.debug('Subscribers notified', { 
      key, 
      subscriberCount: subscribers.size 
    });
  }
  
  private startCleanupTask(): void {
    setInterval(() => {
      let expiredCount = 0;
      
      for (const [key, history] of this.entries) {
        const validHistory = history.filter(entry => {
          const expired = entry.expiresAt && entry.expiresAt < new Date();
          if (expired) expiredCount++;
          return !expired;
        });
        
        if (validHistory.length === 0) {
          this.entries.delete(key);
        } else if (validHistory.length < history.length) {
          this.entries.set(key, validHistory);
        }
      }
      
      if (expiredCount > 0) {
        this.logger.debug('Cleanup completed', { expiredEntries: expiredCount });
      }
    }, 60000);
  }
  
  public getSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};
    
    for (const [key, history] of this.entries) {
      const latest = history[history.length - 1];
      if (!latest.expiresAt || latest.expiresAt >= new Date()) {
        snapshot[key] = latest.value;
      }
    }
    
    return snapshot;
  }
  
  public loadSnapshot(snapshot: Record<string, any>, author: string = 'system'): void {
    for (const [key, value] of Object.entries(snapshot)) {
      this.write(key, value, author, ['snapshot']);
    }
    
    this.logger.info('Snapshot loaded', { 
      keys: Object.keys(snapshot).length 
    });
  }
}