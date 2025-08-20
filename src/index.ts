import { ClaudeEnhancedOrchestrator } from './orchestrator/orchestrator.js';
import { CodingAgent } from './agents/coding-agent.js';
import { ExperienceReplay } from './learning/experience-replay.js';
import { MistakeTracker } from './learning/mistake-tracker.js';
import { TaskParallelizer } from './orchestrator/parallelization.js';
import { Task, TaskPriority, AgentRole } from './core/types.js';

export * from './core/types.js';
export * from './core/agent.js';
export * from './orchestrator/orchestrator.js';
export * from './communication/blackboard.js';
export * from './communication/message-bus.js';
export * from './integrations/version-control.js';
export * from './learning/experience-replay.js';
export * from './learning/mistake-tracker.js';
export * from './orchestrator/parallelization.js';

export interface ClaudeEnhancedConfig {
  projectPath?: string;
  enableVersionControl?: boolean;
  enableLearning?: boolean;
  maxConcurrentTasks?: number;
  logLevel?: string;
}

export class ClaudeEnhanced {
  private orchestrator: ClaudeEnhancedOrchestrator;
  private experienceReplay?: ExperienceReplay;
  private mistakeTracker?: MistakeTracker;
  private parallelizer: TaskParallelizer;
  private config: ClaudeEnhancedConfig;
  
  constructor(config: ClaudeEnhancedConfig = {}) {
    this.config = config;
    
    this.orchestrator = new ClaudeEnhancedOrchestrator({
      projectPath: config.projectPath,
      enableVersionControl: config.enableVersionControl,
      maxConcurrentTasks: config.maxConcurrentTasks,
      logLevel: config.logLevel,
    });
    
    this.parallelizer = new TaskParallelizer({
      maxConcurrency: config.maxConcurrentTasks,
    });
    
    if (config.enableLearning) {
      this.experienceReplay = new ExperienceReplay();
      this.mistakeTracker = new MistakeTracker();
      this.setupLearningIntegration();
    }
  }
  
  public async initialize(): Promise<void> {
    await this.orchestrator.initialize();
    
    const codingAgent = new CodingAgent({
      id: 'coding-agent-1',
      name: 'Primary Coding Agent',
      blackboard: this.orchestrator.getBlackboard(),
      versionControl: this.orchestrator.getVersionControl(),
    });
    
    this.orchestrator.registerAgent(codingAgent);
    
    console.log('Claude Enhanced initialized successfully');
  }
  
  private setupLearningIntegration(): void {
    if (!this.experienceReplay || !this.mistakeTracker) return;
    
    this.orchestrator.on('taskCompleted', ({ task, result, executionTime }) => {
      const experience = {
        taskId: task.id,
        taskType: task.type,
        input: task,
        output: result,
        success: true,
        executionTime,
        timestamp: new Date(),
      };
      
      this.experienceReplay!.recordExperience(experience);
    });
    
    this.orchestrator.on('taskFailed', ({ task, error, executionTime }) => {
      if (this.mistakeTracker) {
        this.mistakeTracker.recordMistake(
          task.id,
          task.type,
          task.assignedAgent || 'unknown',
          'runtime',
          error.message,
          { task },
          error.stack
        );
      }
      
      const experience = {
        taskId: task.id,
        taskType: task.type,
        input: task,
        output: null,
        success: false,
        executionTime,
        errorMessage: error.message,
        timestamp: new Date(),
      };
      
      this.experienceReplay!.recordExperience(experience);
    });
    
    this.mistakeTracker.on('learningRecommendation', (recommendation) => {
      console.log('Learning recommendation:', recommendation);
      
      this.orchestrator.getBlackboard().write(
        `learning.recommendation.${recommendation.mistakeId}`,
        recommendation,
        'learning-system'
      );
    });
  }
  
  public async executeTask(
    type: string,
    description: string,
    options?: {
      priority?: TaskPriority;
      context?: Record<string, any>;
      parallel?: boolean;
    }
  ): Promise<any> {
    const task: Task = {
      id: crypto.randomUUID(),
      type,
      description,
      priority: options?.priority || TaskPriority.NORMAL,
      context: options?.context,
      createdAt: new Date(),
    };
    
    if (options?.parallel) {
      const results = await this.parallelizer.executeTasks([task]);
      return results.get(task.id);
    } else {
      const result = await this.orchestrator.submitTask({
        type,
        description,
        priority: options?.priority,
        context: options?.context,
      });
      
      return result;
    }
  }
  
  public async executeBatch(
    tasks: Array<{
      type: string;
      description: string;
      priority?: TaskPriority;
      dependencies?: string[];
    }>
  ): Promise<Map<string, any>> {
    const parallelTasks = tasks.map(t => ({
      id: crypto.randomUUID(),
      type: t.type,
      description: t.description,
      priority: t.priority || TaskPriority.NORMAL,
      dependsOn: t.dependencies,
      createdAt: new Date(),
    }));
    
    return await this.parallelizer.executeTasks(parallelTasks);
  }
  
  public getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {
      orchestrator: {
        activeAgents: this.orchestrator.getAgents().length,
        activeTasks: this.orchestrator.getActiveTaskCount(),
      },
      parallelizer: this.parallelizer.getMetrics(),
    };
    
    if (this.experienceReplay) {
      metrics.learning = this.experienceReplay.getMetrics();
    }
    
    if (this.mistakeTracker) {
      metrics.mistakes = {
        patterns: this.mistakeTracker.getPatterns().length,
        mostCommon: this.mistakeTracker.getMostCommonMistakes(5),
      };
    }
    
    return metrics;
  }
  
  public async shutdown(): Promise<void> {
    await this.orchestrator.shutdown();
    await this.parallelizer.shutdown();
    
    if (this.experienceReplay) {
      this.experienceReplay.reset();
    }
    
    console.log('Claude Enhanced shut down successfully');
  }
}

async function main() {
  const enhancedSystem = new ClaudeEnhanced({
    projectPath: process.cwd(),
    enableVersionControl: true,
    enableLearning: true,
    maxConcurrentTasks: 5,
    logLevel: 'info',
  });
  
  await enhancedSystem.initialize();
  
  const result = await enhancedSystem.executeTask(
    'feature',
    'Implement a new authentication system with JWT tokens',
    {
      priority: TaskPriority.HIGH,
      context: {
        framework: 'express',
        database: 'postgresql',
      },
    }
  );
  
  console.log('Task result:', result);
  
  const batchResults = await enhancedSystem.executeBatch([
    {
      type: 'analyze',
      description: 'Analyze the current codebase structure',
    },
    {
      type: 'optimize',
      description: 'Optimize database queries',
      dependencies: ['analyze'],
    },
    {
      type: 'test',
      description: 'Generate unit tests',
      priority: TaskPriority.HIGH,
    },
  ]);
  
  console.log('Batch results:', batchResults);
  
  const metrics = enhancedSystem.getMetrics();
  console.log('System metrics:', JSON.stringify(metrics, null, 2));
  
  await enhancedSystem.shutdown();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}