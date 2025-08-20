import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import {
  AgentRole,
  AgentStatus,
  AgentCapability,
  AgentMetrics,
  Task,
  Message,
  MessageType,
} from './types.js';

export interface AgentConfig {
  id?: string;
  name: string;
  role: AgentRole;
  capabilities: AgentCapability[];
  maxConcurrentTasks?: number;
  timeout?: number;
  logLevel?: string;
}

export abstract class BaseAgent extends EventEmitter {
  public readonly id: string;
  public readonly name: string;
  public readonly role: AgentRole;
  public readonly capabilities: AgentCapability[];
  
  protected status: AgentStatus = AgentStatus.IDLE;
  protected currentTasks: Map<string, Task> = new Map();
  protected metrics: AgentMetrics;
  protected logger: winston.Logger;
  protected maxConcurrentTasks: number;
  protected timeout: number;
  
  constructor(config: AgentConfig) {
    super();
    
    this.id = config.id || uuidv4();
    this.name = config.name;
    this.role = config.role;
    this.capabilities = config.capabilities;
    this.maxConcurrentTasks = config.maxConcurrentTasks || 1;
    this.timeout = config.timeout || 30000;
    
    this.metrics = {
      tasksCompleted: 0,
      tasksFailed: 0,
      averageExecutionTime: 0,
      successRate: 0,
      lastActivityTime: new Date(),
    };
    
    this.logger = winston.createLogger({
      level: config.logLevel || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [${this.name}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.File({
          filename: `logs/agent-${this.id}.log`,
        }),
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
      ],
    });
    
    this.logger.info(`Agent initialized`, { role: this.role, capabilities: this.capabilities.map(c => c.name) });
  }
  
  public getStatus(): AgentStatus {
    return this.status;
  }
  
  public getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }
  
  public canHandleTask(task: Task): boolean {
    if (this.status === AgentStatus.ERROR || this.status === AgentStatus.TERMINATED) {
      return false;
    }
    
    if (this.currentTasks.size >= this.maxConcurrentTasks) {
      return false;
    }
    
    return this.hasCapabilityForTask(task);
  }
  
  protected abstract hasCapabilityForTask(task: Task): boolean;
  
  public async processTask(task: Task): Promise<any> {
    if (!this.canHandleTask(task)) {
      throw new Error(`Agent ${this.name} cannot handle task ${task.id}`);
    }
    
    this.currentTasks.set(task.id, task);
    this.status = AgentStatus.BUSY;
    this.logger.info(`Processing task`, { taskId: task.id, type: task.type });
    
    const startTime = Date.now();
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), task.timeout || this.timeout);
      });
      
      const result = await Promise.race([
        this.executeTask(task),
        timeoutPromise,
      ]);
      
      const executionTime = Date.now() - startTime;
      this.updateMetrics(true, executionTime);
      
      this.logger.info(`Task completed`, { 
        taskId: task.id, 
        executionTime,
        result: typeof result === 'object' ? JSON.stringify(result).slice(0, 100) : result 
      });
      
      this.emit('taskCompleted', { task, result, executionTime });
      
      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateMetrics(false, executionTime);
      
      this.logger.error(`Task failed`, { 
        taskId: task.id, 
        error: error instanceof Error ? error.message : String(error),
        executionTime 
      });
      
      this.emit('taskFailed', { task, error, executionTime });
      
      throw error;
    } finally {
      this.currentTasks.delete(task.id);
      if (this.currentTasks.size === 0) {
        this.status = AgentStatus.IDLE;
      }
    }
  }
  
  protected abstract executeTask(task: Task): Promise<any>;
  
  public async handleMessage(message: Message): Promise<void> {
    this.logger.debug(`Received message`, { 
      from: message.from, 
      type: message.type,
      correlationId: message.correlationId 
    });
    
    switch (message.type) {
      case MessageType.TASK:
        await this.processTask(message.payload as Task);
        break;
      case MessageType.CONTROL:
        await this.handleControlMessage(message);
        break;
      case MessageType.HEARTBEAT:
        this.emit('heartbeat', { agentId: this.id, timestamp: new Date() });
        break;
      default:
        this.logger.warn(`Unknown message type`, { type: message.type });
    }
  }
  
  protected async handleControlMessage(message: Message): Promise<void> {
    const { command, params } = message.payload;
    
    switch (command) {
      case 'shutdown':
        await this.shutdown();
        break;
      case 'reset':
        await this.reset();
        break;
      case 'updateConfig':
        await this.updateConfig(params);
        break;
      default:
        this.logger.warn(`Unknown control command`, { command });
    }
  }
  
  protected updateMetrics(success: boolean, executionTime: number): void {
    if (success) {
      this.metrics.tasksCompleted++;
    } else {
      this.metrics.tasksFailed++;
    }
    
    const totalTasks = this.metrics.tasksCompleted + this.metrics.tasksFailed;
    this.metrics.averageExecutionTime = 
      (this.metrics.averageExecutionTime * (totalTasks - 1) + executionTime) / totalTasks;
    
    this.metrics.successRate = 
      totalTasks > 0 ? this.metrics.tasksCompleted / totalTasks : 0;
    
    this.metrics.lastActivityTime = new Date();
  }
  
  public async shutdown(): Promise<void> {
    this.logger.info(`Shutting down agent`);
    
    for (const taskId of this.currentTasks.keys()) {
      this.logger.warn(`Cancelling task due to shutdown`, { taskId });
    }
    
    this.currentTasks.clear();
    this.status = AgentStatus.TERMINATED;
    this.emit('shutdown', { agentId: this.id });
    this.removeAllListeners();
  }
  
  protected async reset(): Promise<void> {
    this.logger.info(`Resetting agent`);
    
    this.currentTasks.clear();
    this.status = AgentStatus.IDLE;
    this.metrics = {
      tasksCompleted: 0,
      tasksFailed: 0,
      averageExecutionTime: 0,
      successRate: 0,
      lastActivityTime: new Date(),
    };
    
    this.emit('reset', { agentId: this.id });
  }
  
  protected async updateConfig(params: any): Promise<void> {
    this.logger.info(`Updating configuration`, { params });
    
    if (params.maxConcurrentTasks !== undefined) {
      this.maxConcurrentTasks = params.maxConcurrentTasks;
    }
    
    if (params.timeout !== undefined) {
      this.timeout = params.timeout;
    }
    
    this.emit('configUpdated', { agentId: this.id, params });
  }
}