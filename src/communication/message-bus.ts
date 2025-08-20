import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import PQueue from 'p-queue';
import winston from 'winston';
import { Message, MessageType, MessageSchema } from '../core/types.js';

export interface MessageBusConfig {
  maxQueueSize?: number;
  maxConcurrency?: number;
  messageTimeout?: number;
  enableDeadLetterQueue?: boolean;
  logLevel?: string;
}

export interface MessageHandler {
  (message: Message): Promise<void>;
}

export interface MessageFilter {
  type?: MessageType;
  from?: string | RegExp;
  to?: string | RegExp;
  correlationId?: string;
}

export class MessageBus extends EventEmitter {
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private queues: Map<string, PQueue> = new Map();
  private deadLetterQueue: Message[] = [];
  private messageHistory: Message[] = [];
  private config: Required<MessageBusConfig>;
  private logger: winston.Logger;
  
  constructor(config?: MessageBusConfig) {
    super();
    
    this.config = {
      maxQueueSize: config?.maxQueueSize || 1000,
      maxConcurrency: config?.maxConcurrency || 10,
      messageTimeout: config?.messageTimeout || 30000,
      enableDeadLetterQueue: config?.enableDeadLetterQueue ?? true,
      logLevel: config?.logLevel || 'info',
    };
    
    this.logger = winston.createLogger({
      level: this.config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [MessageBus] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/message-bus.log' }),
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
      ],
    });
  }
  
  public async send(
    from: string,
    to: string,
    type: MessageType,
    payload: any,
    correlationId?: string
  ): Promise<string> {
    const message: Message = {
      id: uuidv4(),
      type,
      from,
      to,
      payload,
      timestamp: new Date(),
      correlationId,
    };
    
    try {
      MessageSchema.parse(message);
    } catch (error) {
      this.logger.error('Invalid message format', { error, message });
      throw new Error(`Invalid message format: ${error}`);
    }
    
    this.logger.debug('Sending message', {
      id: message.id,
      from,
      to,
      type,
      correlationId,
    });
    
    const queue = this.getOrCreateQueue(to);
    
    if (queue.size >= this.config.maxQueueSize) {
      this.logger.warn('Queue full, message rejected', { to, queueSize: queue.size });
      
      if (this.config.enableDeadLetterQueue) {
        this.deadLetterQueue.push(message);
      }
      
      throw new Error(`Queue full for recipient ${to}`);
    }
    
    await queue.add(async () => {
      await this.processMessage(message);
    });
    
    this.messageHistory.push(message);
    
    if (this.messageHistory.length > 10000) {
      this.messageHistory = this.messageHistory.slice(-5000);
    }
    
    return message.id;
  }
  
  public async broadcast(
    from: string,
    type: MessageType,
    payload: any,
    recipients?: string[]
  ): Promise<string[]> {
    const correlationId = uuidv4();
    const messageIds: string[] = [];
    
    const targetRecipients = recipients || Array.from(this.handlers.keys());
    
    for (const to of targetRecipients) {
      try {
        const id = await this.send(from, to, type, payload, correlationId);
        messageIds.push(id);
      } catch (error) {
        this.logger.error('Broadcast failed for recipient', { to, error });
      }
    }
    
    this.logger.info('Broadcast sent', {
      from,
      type,
      correlationId,
      recipientCount: messageIds.length,
    });
    
    return messageIds;
  }
  
  public register(agentId: string, handler: MessageHandler): void {
    if (!this.handlers.has(agentId)) {
      this.handlers.set(agentId, new Set());
    }
    
    this.handlers.get(agentId)!.add(handler);
    
    this.logger.info('Handler registered', { agentId });
  }
  
  public unregister(agentId: string, handler?: MessageHandler): void {
    if (!this.handlers.has(agentId)) {
      return;
    }
    
    if (handler) {
      this.handlers.get(agentId)!.delete(handler);
      
      if (this.handlers.get(agentId)!.size === 0) {
        this.handlers.delete(agentId);
        this.queues.delete(agentId);
      }
    } else {
      this.handlers.delete(agentId);
      this.queues.delete(agentId);
    }
    
    this.logger.info('Handler unregistered', { agentId });
  }
  
  private async processMessage(message: Message): Promise<void> {
    const handlers = this.handlers.get(message.to);
    
    if (!handlers || handlers.size === 0) {
      this.logger.warn('No handlers for recipient', { to: message.to });
      
      if (this.config.enableDeadLetterQueue) {
        this.deadLetterQueue.push(message);
      }
      
      return;
    }
    
    const startTime = Date.now();
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Message processing timeout')), this.config.messageTimeout);
      });
      
      const processingPromises = Array.from(handlers).map(handler =>
        handler(message).catch(error => {
          this.logger.error('Handler error', {
            messageId: message.id,
            to: message.to,
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        })
      );
      
      await Promise.race([
        Promise.all(processingPromises),
        timeoutPromise,
      ]);
      
      const processingTime = Date.now() - startTime;
      
      this.logger.debug('Message processed', {
        id: message.id,
        processingTime,
      });
      
      this.emit('messageProcessed', { message, processingTime });
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Message processing failed', {
        id: message.id,
        error: error instanceof Error ? error.message : String(error),
        processingTime,
      });
      
      if (this.config.enableDeadLetterQueue) {
        this.deadLetterQueue.push(message);
      }
      
      this.emit('messageError', { message, error, processingTime });
      
      throw error;
    }
  }
  
  private getOrCreateQueue(agentId: string): PQueue {
    if (!this.queues.has(agentId)) {
      this.queues.set(agentId, new PQueue({
        concurrency: this.config.maxConcurrency,
      }));
    }
    
    return this.queues.get(agentId)!;
  }
  
  public getDeadLetterQueue(): Message[] {
    return [...this.deadLetterQueue];
  }
  
  public clearDeadLetterQueue(): void {
    const count = this.deadLetterQueue.length;
    this.deadLetterQueue = [];
    this.logger.info('Dead letter queue cleared', { messagesCleared: count });
  }
  
  public async retryDeadLetterMessage(messageId: string): Promise<boolean> {
    const messageIndex = this.deadLetterQueue.findIndex(m => m.id === messageId);
    
    if (messageIndex === -1) {
      return false;
    }
    
    const [message] = this.deadLetterQueue.splice(messageIndex, 1);
    
    try {
      await this.send(message.from, message.to, message.type, message.payload, message.correlationId);
      this.logger.info('Dead letter message retried successfully', { messageId });
      return true;
    } catch (error) {
      this.deadLetterQueue.push(message);
      this.logger.error('Dead letter message retry failed', { messageId, error });
      return false;
    }
  }
  
  public queryHistory(filter: MessageFilter, limit?: number): Message[] {
    let results = [...this.messageHistory];
    
    if (filter.type !== undefined) {
      results = results.filter(m => m.type === filter.type);
    }
    
    if (filter.from !== undefined) {
      if (filter.from instanceof RegExp) {
        results = results.filter(m => filter.from!.test(m.from));
      } else {
        results = results.filter(m => m.from === filter.from);
      }
    }
    
    if (filter.to !== undefined) {
      if (filter.to instanceof RegExp) {
        results = results.filter(m => filter.to!.test(m.to));
      } else {
        results = results.filter(m => m.to === filter.to);
      }
    }
    
    if (filter.correlationId !== undefined) {
      results = results.filter(m => m.correlationId === filter.correlationId);
    }
    
    if (limit) {
      results = results.slice(-limit);
    }
    
    return results;
  }
  
  public getQueueStatus(): Record<string, { size: number; pending: number }> {
    const status: Record<string, { size: number; pending: number }> = {};
    
    for (const [agentId, queue] of this.queues) {
      status[agentId] = {
        size: queue.size,
        pending: queue.pending,
      };
    }
    
    return status;
  }
  
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down message bus');
    
    for (const queue of this.queues.values()) {
      queue.clear();
    }
    
    this.handlers.clear();
    this.queues.clear();
    this.deadLetterQueue = [];
    this.messageHistory = [];
    
    this.emit('shutdown');
    this.removeAllListeners();
  }
}