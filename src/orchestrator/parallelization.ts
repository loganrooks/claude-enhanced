import { EventEmitter } from 'eventemitter3';
import PQueue from 'p-queue';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import { Task, TaskPriority } from '../core/types.js';

export interface ParallelTask extends Task {
  subtasks?: ParallelTask[];
  dependsOn?: string[];
  status?: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: Error;
  startTime?: Date;
  endTime?: Date;
}

export interface DependencyGraph {
  nodes: Map<string, ParallelTask>;
  edges: Map<string, Set<string>>;
  inDegree: Map<string, number>;
  outDegree: Map<string, number>;
}

export interface ExecutionPlan {
  stages: ParallelTask[][];
  criticalPath: string[];
  estimatedDuration: number;
  parallelismFactor: number;
}

export interface ParallelizationConfig {
  maxConcurrency?: number;
  maxQueueSize?: number;
  priorityQueues?: boolean;
  loadBalancing?: 'round-robin' | 'least-loaded' | 'weighted';
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
    exponential?: boolean;
  };
  logLevel?: string;
}

export class TaskParallelizer extends EventEmitter {
  private queues: Map<TaskPriority, PQueue> = new Map();
  private executionGraph: DependencyGraph;
  private activeTasks: Map<string, ParallelTask> = new Map();
  private completedTasks: Map<string, ParallelTask> = new Map();
  private config: Required<ParallelizationConfig>;
  private logger: winston.Logger;
  private metrics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
  };
  
  constructor(config?: ParallelizationConfig) {
    super();
    
    this.config = {
      maxConcurrency: config?.maxConcurrency || 10,
      maxQueueSize: config?.maxQueueSize || 1000,
      priorityQueues: config?.priorityQueues ?? true,
      loadBalancing: config?.loadBalancing || 'least-loaded',
      timeout: config?.timeout || 60000,
      retryPolicy: config?.retryPolicy || {
        maxRetries: 3,
        backoffMs: 1000,
        exponential: true,
      },
      logLevel: config?.logLevel || 'info',
    };
    
    this.executionGraph = {
      nodes: new Map(),
      edges: new Map(),
      inDegree: new Map(),
      outDegree: new Map(),
    };
    
    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0,
    };
    
    this.logger = winston.createLogger({
      level: this.config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [Parallelizer] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/parallelization.log' }),
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
      ],
    });
    
    this.initializeQueues();
  }
  
  private initializeQueues(): void {
    if (this.config.priorityQueues) {
      for (const priority of Object.values(TaskPriority)) {
        if (typeof priority === 'number') {
          this.queues.set(priority, new PQueue({
            concurrency: Math.ceil(this.config.maxConcurrency / 4),
          }));
        }
      }
    } else {
      this.queues.set(TaskPriority.NORMAL, new PQueue({
        concurrency: this.config.maxConcurrency,
      }));
    }
  }
  
  public async executeTasks(tasks: ParallelTask[]): Promise<Map<string, any>> {
    this.logger.info(`Starting parallel execution`, { taskCount: tasks.length });
    
    this.buildDependencyGraph(tasks);
    
    const executionPlan = this.createExecutionPlan();
    
    this.logger.info(`Execution plan created`, {
      stages: executionPlan.stages.length,
      criticalPathLength: executionPlan.criticalPath.length,
      parallelismFactor: executionPlan.parallelismFactor,
    });
    
    const results = new Map<string, any>();
    
    for (const stage of executionPlan.stages) {
      await this.executeStage(stage, results);
    }
    
    this.logger.info(`Parallel execution completed`, {
      totalTasks: this.metrics.totalTasks,
      completedTasks: this.metrics.completedTasks,
      failedTasks: this.metrics.failedTasks,
      averageExecutionTime: this.metrics.averageExecutionTime,
    });
    
    return results;
  }
  
  private buildDependencyGraph(tasks: ParallelTask[]): void {
    this.executionGraph = {
      nodes: new Map(),
      edges: new Map(),
      inDegree: new Map(),
      outDegree: new Map(),
    };
    
    for (const task of tasks) {
      this.addTaskToGraph(task);
    }
    
    for (const task of tasks) {
      if (task.dependsOn) {
        for (const dependency of task.dependsOn) {
          this.addEdge(dependency, task.id);
        }
      }
    }
    
    this.detectCycles();
  }
  
  private addTaskToGraph(task: ParallelTask): void {
    this.executionGraph.nodes.set(task.id, task);
    this.executionGraph.edges.set(task.id, new Set());
    this.executionGraph.inDegree.set(task.id, 0);
    this.executionGraph.outDegree.set(task.id, 0);
    
    if (task.subtasks) {
      for (const subtask of task.subtasks) {
        this.addTaskToGraph(subtask);
        this.addEdge(task.id, subtask.id);
      }
    }
  }
  
  private addEdge(from: string, to: string): void {
    if (!this.executionGraph.edges.has(from)) {
      this.executionGraph.edges.set(from, new Set());
    }
    
    this.executionGraph.edges.get(from)!.add(to);
    
    const currentInDegree = this.executionGraph.inDegree.get(to) || 0;
    this.executionGraph.inDegree.set(to, currentInDegree + 1);
    
    const currentOutDegree = this.executionGraph.outDegree.get(from) || 0;
    this.executionGraph.outDegree.set(from, currentOutDegree + 1);
  }
  
  private detectCycles(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    for (const taskId of this.executionGraph.nodes.keys()) {
      if (!visited.has(taskId)) {
        if (this.hasCycleDFS(taskId, visited, recursionStack)) {
          throw new Error(`Circular dependency detected in task graph`);
        }
      }
    }
  }
  
  private hasCycleDFS(
    taskId: string,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    visited.add(taskId);
    recursionStack.add(taskId);
    
    const edges = this.executionGraph.edges.get(taskId) || new Set();
    
    for (const neighbor of edges) {
      if (!visited.has(neighbor)) {
        if (this.hasCycleDFS(neighbor, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }
    
    recursionStack.delete(taskId);
    return false;
  }
  
  private createExecutionPlan(): ExecutionPlan {
    const stages: ParallelTask[][] = [];
    const inDegreeCopy = new Map(this.executionGraph.inDegree);
    const processed = new Set<string>();
    
    while (processed.size < this.executionGraph.nodes.size) {
      const stage: ParallelTask[] = [];
      
      for (const [taskId, inDegree] of inDegreeCopy) {
        if (inDegree === 0 && !processed.has(taskId)) {
          const task = this.executionGraph.nodes.get(taskId)!;
          stage.push(task);
          processed.add(taskId);
        }
      }
      
      if (stage.length === 0 && processed.size < this.executionGraph.nodes.size) {
        throw new Error('Unable to create execution plan - possible circular dependency');
      }
      
      for (const task of stage) {
        const edges = this.executionGraph.edges.get(task.id) || new Set();
        for (const dependent of edges) {
          const currentInDegree = inDegreeCopy.get(dependent)! - 1;
          inDegreeCopy.set(dependent, currentInDegree);
        }
      }
      
      if (stage.length > 0) {
        stages.push(stage);
      }
    }
    
    const criticalPath = this.findCriticalPath();
    const parallelismFactor = this.calculateParallelismFactor(stages);
    
    return {
      stages,
      criticalPath,
      estimatedDuration: stages.length * 1000,
      parallelismFactor,
    };
  }
  
  private findCriticalPath(): string[] {
    const distances = new Map<string, number>();
    const predecessors = new Map<string, string | null>();
    
    for (const taskId of this.executionGraph.nodes.keys()) {
      distances.set(taskId, 0);
      predecessors.set(taskId, null);
    }
    
    const topologicalOrder = this.topologicalSort();
    
    for (const taskId of topologicalOrder) {
      const edges = this.executionGraph.edges.get(taskId) || new Set();
      
      for (const neighbor of edges) {
        const weight = 1;
        const newDistance = distances.get(taskId)! + weight;
        
        if (newDistance > distances.get(neighbor)!) {
          distances.set(neighbor, newDistance);
          predecessors.set(neighbor, taskId);
        }
      }
    }
    
    let maxDistance = 0;
    let endNode: string | null = null;
    
    for (const [taskId, distance] of distances) {
      if (distance > maxDistance) {
        maxDistance = distance;
        endNode = taskId;
      }
    }
    
    const path: string[] = [];
    let current = endNode;
    
    while (current !== null) {
      path.unshift(current);
      current = predecessors.get(current)!;
    }
    
    return path;
  }
  
  private topologicalSort(): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    
    for (const taskId of this.executionGraph.nodes.keys()) {
      if (!visited.has(taskId)) {
        this.topologicalSortDFS(taskId, visited, sorted);
      }
    }
    
    return sorted.reverse();
  }
  
  private topologicalSortDFS(
    taskId: string,
    visited: Set<string>,
    sorted: string[]
  ): void {
    visited.add(taskId);
    
    const edges = this.executionGraph.edges.get(taskId) || new Set();
    
    for (const neighbor of edges) {
      if (!visited.has(neighbor)) {
        this.topologicalSortDFS(neighbor, visited, sorted);
      }
    }
    
    sorted.push(taskId);
  }
  
  private calculateParallelismFactor(stages: ParallelTask[][]): number {
    if (stages.length === 0) return 0;
    
    const totalTasks = stages.reduce((sum, stage) => sum + stage.length, 0);
    const maxParallelTasks = Math.max(...stages.map(stage => stage.length));
    
    return maxParallelTasks / (totalTasks / stages.length);
  }
  
  private async executeStage(
    stage: ParallelTask[],
    results: Map<string, any>
  ): Promise<void> {
    this.logger.debug(`Executing stage`, { taskCount: stage.length });
    
    const stagePromises = stage.map(task => this.executeTask(task, results));
    
    await Promise.all(stagePromises);
  }
  
  private async executeTask(
    task: ParallelTask,
    results: Map<string, any>
  ): Promise<void> {
    const queue = this.selectQueue(task);
    
    await queue.add(async () => {
      const startTime = Date.now();
      task.startTime = new Date();
      task.status = 'running';
      
      this.activeTasks.set(task.id, task);
      this.emit('taskStarted', { taskId: task.id });
      
      try {
        const result = await this.executeWithRetry(task);
        
        task.status = 'completed';
        task.result = result;
        task.endTime = new Date();
        
        results.set(task.id, result);
        this.completedTasks.set(task.id, task);
        
        const executionTime = Date.now() - startTime;
        this.updateMetrics(true, executionTime);
        
        this.logger.debug(`Task completed`, {
          taskId: task.id,
          executionTime,
        });
        
        this.emit('taskCompleted', {
          taskId: task.id,
          result,
          executionTime,
        });
      } catch (error) {
        task.status = 'failed';
        task.error = error instanceof Error ? error : new Error(String(error));
        task.endTime = new Date();
        
        const executionTime = Date.now() - startTime;
        this.updateMetrics(false, executionTime);
        
        this.logger.error(`Task failed`, {
          taskId: task.id,
          error: error instanceof Error ? error.message : String(error),
          executionTime,
        });
        
        this.emit('taskFailed', {
          taskId: task.id,
          error,
          executionTime,
        });
        
        throw error;
      } finally {
        this.activeTasks.delete(task.id);
      }
    });
  }
  
  private async executeWithRetry(task: ParallelTask): Promise<any> {
    let lastError: Error | undefined;
    let retryCount = 0;
    
    while (retryCount <= this.config.retryPolicy.maxRetries) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Task timeout')), task.timeout || this.config.timeout);
        });
        
        const taskPromise = this.performTask(task);
        
        return await Promise.race([taskPromise, timeoutPromise]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (retryCount < this.config.retryPolicy.maxRetries) {
          const backoff = this.calculateBackoff(retryCount);
          
          this.logger.warn(`Retrying task`, {
            taskId: task.id,
            retryCount: retryCount + 1,
            backoffMs: backoff,
          });
          
          await new Promise(resolve => setTimeout(resolve, backoff));
          retryCount++;
        } else {
          break;
        }
      }
    }
    
    throw lastError || new Error('Task failed after retries');
  }
  
  private calculateBackoff(retryCount: number): number {
    if (this.config.retryPolicy.exponential) {
      return this.config.retryPolicy.backoffMs * Math.pow(2, retryCount);
    }
    
    return this.config.retryPolicy.backoffMs;
  }
  
  private async performTask(task: ParallelTask): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    return {
      taskId: task.id,
      type: task.type,
      description: task.description,
      timestamp: new Date(),
      simulatedResult: 'Task execution simulated',
    };
  }
  
  private selectQueue(task: ParallelTask): PQueue {
    if (!this.config.priorityQueues) {
      return this.queues.get(TaskPriority.NORMAL)!;
    }
    
    const priority = task.priority || TaskPriority.NORMAL;
    return this.queues.get(priority) || this.queues.get(TaskPriority.NORMAL)!;
  }
  
  private updateMetrics(success: boolean, executionTime: number): void {
    this.metrics.totalTasks++;
    
    if (success) {
      this.metrics.completedTasks++;
    } else {
      this.metrics.failedTasks++;
    }
    
    this.metrics.totalExecutionTime += executionTime;
    this.metrics.averageExecutionTime = 
      this.metrics.totalExecutionTime / this.metrics.totalTasks;
  }
  
  public getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }
  
  public getActiveTasks(): ParallelTask[] {
    return Array.from(this.activeTasks.values());
  }
  
  public getQueueStatus(): Map<TaskPriority, { size: number; pending: number }> {
    const status = new Map<TaskPriority, { size: number; pending: number }>();
    
    for (const [priority, queue] of this.queues) {
      status.set(priority, {
        size: queue.size,
        pending: queue.pending,
      });
    }
    
    return status;
  }
  
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down parallelizer');
    
    for (const queue of this.queues.values()) {
      queue.clear();
    }
    
    this.activeTasks.clear();
    this.completedTasks.clear();
    
    this.emit('shutdown');
    this.removeAllListeners();
  }
}