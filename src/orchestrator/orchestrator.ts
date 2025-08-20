import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import PQueue from 'p-queue';
import winston from 'winston';
import { BaseAgent } from '../core/agent.js';
import { Blackboard } from '../communication/blackboard.js';
import { MessageBus } from '../communication/message-bus.js';
import { VersionControl } from '../integrations/version-control.js';
import {
  Task,
  TaskPriority,
  AgentRole,
  MessageType,
  CodebaseContext,
} from '../core/types.js';

export interface OrchestratorConfig {
  maxConcurrentTasks?: number;
  taskTimeout?: number;
  enableVersionControl?: boolean;
  projectPath?: string;
  logLevel?: string;
}

export interface TaskRequest {
  type: string;
  description: string;
  priority?: TaskPriority;
  context?: Record<string, any>;
  dependencies?: string[];
  timeout?: number;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  result?: any;
  error?: Error;
  executionTime: number;
  assignedAgents: string[];
}

export interface RoutingStrategy {
  analyze(task: Task): AgentRole[];
}

export class DynamicRoutingStrategy implements RoutingStrategy {
  private readonly routingRules: Map<string, AgentRole[]> = new Map([
    ['analyze', [AgentRole.ANALYST]],
    ['design', [AgentRole.ARCHITECT, AgentRole.DESIGNER]],
    ['implement', [AgentRole.CODER]],
    ['feature', [AgentRole.ANALYST, AgentRole.DESIGNER, AgentRole.CODER, AgentRole.TESTER]],
    ['bugfix', [AgentRole.ANALYST, AgentRole.DEBUG, AgentRole.TESTER]],
    ['refactor', [AgentRole.ANALYST, AgentRole.REFACTOR, AgentRole.REVIEWER]],
    ['review', [AgentRole.REVIEWER]],
    ['test', [AgentRole.TESTER]],
    ['security', [AgentRole.SECURITY, AgentRole.REVIEWER]],
    ['optimize', [AgentRole.ANALYST, AgentRole.REFACTOR, AgentRole.REVIEWER]],
  ]);
  
  analyze(task: Task): AgentRole[] {
    const taskType = task.type.toLowerCase();
    
    for (const [pattern, roles] of this.routingRules) {
      if (taskType.includes(pattern)) {
        return roles;
      }
    }
    
    const complexityScore = this.calculateComplexity(task);
    
    if (complexityScore > 0.8) {
      return [
        AgentRole.ARCHITECT,
        AgentRole.ANALYST,
        AgentRole.DESIGNER,
        AgentRole.CODER,
        AgentRole.REVIEWER,
        AgentRole.TESTER,
      ];
    } else if (complexityScore > 0.5) {
      return [AgentRole.ANALYST, AgentRole.CODER, AgentRole.REVIEWER];
    } else {
      return [AgentRole.CODER];
    }
  }
  
  private calculateComplexity(task: Task): number {
    let score = 0;
    
    if (task.priority === TaskPriority.CRITICAL) score += 0.3;
    else if (task.priority === TaskPriority.HIGH) score += 0.2;
    
    const descLength = task.description.length;
    if (descLength > 500) score += 0.3;
    else if (descLength > 200) score += 0.2;
    else if (descLength > 100) score += 0.1;
    
    if (task.dependencies && task.dependencies.length > 0) {
      score += Math.min(0.3, task.dependencies.length * 0.1);
    }
    
    if (task.context && Object.keys(task.context).length > 5) {
      score += 0.2;
    }
    
    return Math.min(1, score);
  }
}

export class ClaudeEnhancedOrchestrator extends EventEmitter {
  private agents: Map<string, BaseAgent> = new Map();
  private blackboard: Blackboard;
  private messageBus: MessageBus;
  private versionControl?: VersionControl;
  private taskQueue: PQueue;
  private activeTasks: Map<string, Task> = new Map();
  private taskResults: Map<string, TaskResult> = new Map();
  private routingStrategy: RoutingStrategy;
  private codebaseContext?: CodebaseContext;
  private logger: winston.Logger;
  private config: Required<OrchestratorConfig>;
  
  constructor(config?: OrchestratorConfig) {
    super();
    
    this.config = {
      maxConcurrentTasks: config?.maxConcurrentTasks || 5,
      taskTimeout: config?.taskTimeout || 60000,
      enableVersionControl: config?.enableVersionControl ?? true,
      projectPath: config?.projectPath || process.cwd(),
      logLevel: config?.logLevel || 'info',
    };
    
    this.blackboard = new Blackboard();
    this.messageBus = new MessageBus({
      maxConcurrency: this.config.maxConcurrentTasks,
    });
    
    if (this.config.enableVersionControl) {
      this.versionControl = new VersionControl(this.config.projectPath);
    }
    
    this.taskQueue = new PQueue({
      concurrency: this.config.maxConcurrentTasks,
    });
    
    this.routingStrategy = new DynamicRoutingStrategy();
    
    this.logger = winston.createLogger({
      level: this.config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [Orchestrator] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/orchestrator.log' }),
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
      ],
    });
    
    this.setupEventHandlers();
    this.logger.info('Orchestrator initialized', { config: this.config });
  }
  
  private setupEventHandlers(): void {
    this.blackboard.on('write', (entry) => {
      this.logger.debug('Blackboard updated', { 
        key: entry.key,
        author: entry.author,
      });
    });
    
    this.messageBus.on('messageError', ({ message, error }) => {
      this.logger.error('Message processing error', {
        messageId: message.id,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }
  
  public registerAgent(agent: BaseAgent): void {
    if (this.agents.has(agent.id)) {
      throw new Error(`Agent ${agent.id} already registered`);
    }
    
    this.agents.set(agent.id, agent);
    
    this.messageBus.register(agent.id, async (message) => {
      await agent.handleMessage(message);
    });
    
    agent.on('taskCompleted', ({ task, result, executionTime }) => {
      this.handleAgentTaskCompletion(agent.id, task, result, executionTime);
    });
    
    agent.on('taskFailed', ({ task, error, executionTime }) => {
      this.handleAgentTaskFailure(agent.id, task, error, executionTime);
    });
    
    this.logger.info('Agent registered', { 
      agentId: agent.id,
      name: agent.name,
      role: agent.role,
    });
  }
  
  public unregisterAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }
    
    this.messageBus.unregister(agentId);
    agent.removeAllListeners();
    this.agents.delete(agentId);
    
    this.logger.info('Agent unregistered', { agentId });
  }
  
  public async initialize(): Promise<void> {
    this.logger.info('Initializing orchestrator');
    
    if (this.versionControl) {
      try {
        const gitContext = await this.versionControl.getContext();
        const analysis = await this.versionControl.analyzeRepository();
        
        this.codebaseContext = {
          rootPath: this.config.projectPath,
          language: 'typescript',
          framework: 'node',
          dependencies: {},
          gitContext,
        };
        
        this.blackboard.write('git.context', gitContext, 'orchestrator');
        this.blackboard.write('git.analysis', analysis, 'orchestrator');
        
        this.logger.info('Version control initialized', {
          branch: gitContext.branch,
          isClean: analysis.isClean,
        });
      } catch (error) {
        this.logger.warn('Failed to initialize version control', { error });
      }
    }
    
    await this.loadCodebaseContext();
    
    this.logger.info('Orchestrator initialization complete');
  }
  
  private async loadCodebaseContext(): Promise<void> {
    this.blackboard.write('codebase.context', this.codebaseContext, 'orchestrator');
  }
  
  public async submitTask(request: TaskRequest): Promise<TaskResult> {
    const task: Task = {
      id: uuidv4(),
      type: request.type,
      description: request.description,
      priority: request.priority || TaskPriority.NORMAL,
      context: request.context,
      dependencies: request.dependencies,
      timeout: request.timeout,
      createdAt: new Date(),
    };
    
    this.logger.info('Task submitted', {
      taskId: task.id,
      type: task.type,
      priority: task.priority,
    });
    
    this.activeTasks.set(task.id, task);
    
    const result = await this.taskQueue.add(async () => {
      return await this.executeTask(task);
    });
    
    this.activeTasks.delete(task.id);
    
    return result as TaskResult;
  }
  
  private async executeTask(task: Task): Promise<TaskResult> {
    const startTime = Date.now();
    const requiredRoles = this.routingStrategy.analyze(task);
    
    this.logger.info('Task routing determined', {
      taskId: task.id,
      requiredRoles,
    });
    
    this.blackboard.write(`task.${task.id}`, task, 'orchestrator', ['active']);
    
    const assignedAgents: string[] = [];
    const availableAgents = this.selectAgents(requiredRoles);
    
    if (availableAgents.length === 0) {
      const error = new Error('No available agents for task');
      this.logger.error('Task failed - no agents', { taskId: task.id, requiredRoles });
      
      return {
        taskId: task.id,
        success: false,
        error,
        executionTime: Date.now() - startTime,
        assignedAgents: [],
      };
    }
    
    try {
      const agentPromises = availableAgents.map(async (agent) => {
        assignedAgents.push(agent.id);
        
        const agentTask = {
          ...task,
          assignedAgent: agent.id,
        };
        
        return await this.messageBus.send(
          'orchestrator',
          agent.id,
          MessageType.TASK,
          agentTask,
          task.id
        );
      });
      
      await Promise.all(agentPromises);
      
      const resultPromise = new Promise<TaskResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Task timeout'));
        }, task.timeout || this.config.taskTimeout);
        
        const checkCompletion = setInterval(() => {
          if (this.taskResults.has(task.id)) {
            clearTimeout(timeout);
            clearInterval(checkCompletion);
            resolve(this.taskResults.get(task.id)!);
          }
        }, 100);
      });
      
      const result = await resultPromise;
      
      this.blackboard.write(
        `task.${task.id}.result`,
        result,
        'orchestrator',
        ['completed']
      );
      
      return result;
    } catch (error) {
      this.logger.error('Task execution failed', {
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error),
      });
      
      return {
        taskId: task.id,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        executionTime: Date.now() - startTime,
        assignedAgents,
      };
    }
  }
  
  private selectAgents(requiredRoles: AgentRole[]): BaseAgent[] {
    const selectedAgents: BaseAgent[] = [];
    
    for (const role of requiredRoles) {
      const agentsWithRole = Array.from(this.agents.values()).filter(
        agent => agent.role === role
      );
      
      const availableAgent = agentsWithRole.find(agent => 
        agent.getStatus() === 'idle'
      );
      
      if (availableAgent) {
        selectedAgents.push(availableAgent);
      } else if (agentsWithRole.length > 0) {
        selectedAgents.push(agentsWithRole[0]);
      }
    }
    
    return selectedAgents;
  }
  
  private handleAgentTaskCompletion(
    agentId: string,
    task: Task,
    result: any,
    executionTime: number
  ): void {
    this.logger.info('Agent task completed', {
      agentId,
      taskId: task.id,
      executionTime,
    });
    
    this.blackboard.write(
      `agent.${agentId}.lastResult`,
      { task, result, executionTime },
      agentId
    );
    
    if (!this.taskResults.has(task.id)) {
      this.taskResults.set(task.id, {
        taskId: task.id,
        success: true,
        result,
        executionTime,
        assignedAgents: [agentId],
      });
    }
  }
  
  private handleAgentTaskFailure(
    agentId: string,
    task: Task,
    error: Error,
    executionTime: number
  ): void {
    this.logger.error('Agent task failed', {
      agentId,
      taskId: task.id,
      error: error.message,
      executionTime,
    });
    
    this.blackboard.write(
      `agent.${agentId}.lastError`,
      { task, error: error.message, executionTime },
      agentId
    );
    
    if (!this.taskResults.has(task.id)) {
      this.taskResults.set(task.id, {
        taskId: task.id,
        success: false,
        error,
        executionTime,
        assignedAgents: [agentId],
      });
    }
  }
  
  public getBlackboard(): Blackboard {
    return this.blackboard;
  }
  
  public getMessageBus(): MessageBus {
    return this.messageBus;
  }
  
  public getVersionControl(): VersionControl | undefined {
    return this.versionControl;
  }
  
  public getAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
  
  public getActiveTaskCount(): number {
    return this.activeTasks.size;
  }
  
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down orchestrator');
    
    this.taskQueue.clear();
    
    for (const agent of this.agents.values()) {
      await agent.shutdown();
    }
    
    await this.messageBus.shutdown();
    
    this.blackboard.clear();
    
    this.emit('shutdown');
    this.removeAllListeners();
    
    this.logger.info('Orchestrator shutdown complete');
  }
}