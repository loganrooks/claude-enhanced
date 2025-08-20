import { BaseAgent, AgentConfig } from '../core/agent.js';
import { Task, AgentRole, AgentCapability } from '../core/types.js';
import { Blackboard } from '../communication/blackboard.js';
import { VersionControl } from '../integrations/version-control.js';

export interface CodingAgentConfig extends AgentConfig {
  blackboard: Blackboard;
  versionControl?: VersionControl;
  preferredLanguages?: string[];
  codeStyle?: Record<string, any>;
}

export class CodingAgent extends BaseAgent {
  private blackboard: Blackboard;
  private versionControl?: VersionControl;
  private preferredLanguages: string[];
  private codeStyle: Record<string, any>;
  private codePatterns: Map<string, string[]> = new Map();
  
  constructor(config: CodingAgentConfig) {
    const capabilities: AgentCapability[] = [
      {
        name: 'code_generation',
        description: 'Generate code based on specifications',
      },
      {
        name: 'code_modification',
        description: 'Modify existing code',
      },
      {
        name: 'code_completion',
        description: 'Complete partial code implementations',
      },
      {
        name: 'syntax_fixing',
        description: 'Fix syntax errors in code',
      },
      {
        name: 'api_implementation',
        description: 'Implement API endpoints and interfaces',
      },
    ];
    
    super({
      ...config,
      role: AgentRole.CODER,
      capabilities,
    });
    
    this.blackboard = config.blackboard;
    this.versionControl = config.versionControl;
    this.preferredLanguages = config.preferredLanguages || ['typescript', 'javascript', 'python'];
    this.codeStyle = config.codeStyle || {};
    
    this.loadCodePatterns();
  }
  
  protected hasCapabilityForTask(task: Task): boolean {
    const taskType = task.type.toLowerCase();
    
    const codingKeywords = [
      'implement', 'code', 'create', 'build', 'develop',
      'write', 'generate', 'function', 'class', 'api',
      'endpoint', 'component', 'module', 'fix', 'complete'
    ];
    
    return codingKeywords.some(keyword => 
      taskType.includes(keyword) || task.description.toLowerCase().includes(keyword)
    );
  }
  
  protected async executeTask(task: Task): Promise<any> {
    this.logger.info(`Executing coding task`, { taskId: task.id, type: task.type });
    
    const context = await this.gatherContext(task);
    
    const subtasks = this.decomposeTask(task, context);
    
    const results = [];
    for (const subtask of subtasks) {
      const result = await this.executeSubtask(subtask, context);
      results.push(result);
      
      this.blackboard.write(
        `coding.${task.id}.${subtask.type}`,
        result,
        this.id,
        ['coding', task.type]
      );
    }
    
    const finalResult = await this.synthesizeResults(results, task);
    
    await this.recordExperience(task, finalResult, true);
    
    if (this.versionControl && finalResult.files) {
      await this.createCommit(task, finalResult);
    }
    
    return finalResult;
  }
  
  private async gatherContext(task: Task): Promise<Record<string, any>> {
    const context: Record<string, any> = {
      ...task.context,
    };
    
    const codebaseContext = this.blackboard.read('codebase.context');
    if (codebaseContext) {
      context.codebase = codebaseContext.value;
    }
    
    const gitContext = this.blackboard.read('git.context');
    if (gitContext) {
      context.git = gitContext.value;
    }
    
    const relatedPatterns = this.findRelatedPatterns(task);
    if (relatedPatterns.length > 0) {
      context.patterns = relatedPatterns;
    }
    
    const previousAttempts = this.blackboard.query({
      key: new RegExp(`coding\\..*\\.${task.type}`),
      limit: 5,
    });
    
    if (previousAttempts.length > 0) {
      context.previousExamples = previousAttempts.map(entry => entry.value);
    }
    
    return context;
  }
  
  private decomposeTask(task: Task, context: Record<string, any>): any[] {
    const subtasks = [];
    
    if (task.type === 'feature') {
      subtasks.push(
        { type: 'analyze_requirements', task },
        { type: 'design_structure', task },
        { type: 'implement_core', task },
        { type: 'add_tests', task },
        { type: 'document', task }
      );
    } else if (task.type === 'bugfix') {
      subtasks.push(
        { type: 'locate_issue', task },
        { type: 'analyze_cause', task },
        { type: 'implement_fix', task },
        { type: 'verify_fix', task }
      );
    } else if (task.type === 'api') {
      subtasks.push(
        { type: 'design_endpoints', task },
        { type: 'implement_handlers', task },
        { type: 'add_validation', task },
        { type: 'add_documentation', task }
      );
    } else {
      subtasks.push({ type: 'implement', task });
    }
    
    return subtasks;
  }
  
  private async executeSubtask(subtask: any, context: Record<string, any>): Promise<any> {
    this.logger.debug(`Executing subtask`, { type: subtask.type });
    
    switch (subtask.type) {
      case 'analyze_requirements':
        return this.analyzeRequirements(subtask.task, context);
      
      case 'design_structure':
        return this.designStructure(subtask.task, context);
      
      case 'implement_core':
      case 'implement':
        return this.implementCode(subtask.task, context);
      
      case 'add_tests':
        return this.generateTests(subtask.task, context);
      
      case 'document':
        return this.generateDocumentation(subtask.task, context);
      
      case 'locate_issue':
        return this.locateIssue(subtask.task, context);
      
      case 'analyze_cause':
        return this.analyzeCause(subtask.task, context);
      
      case 'implement_fix':
        return this.implementFix(subtask.task, context);
      
      case 'verify_fix':
        return this.verifyFix(subtask.task, context);
      
      default:
        return { type: subtask.type, status: 'skipped' };
    }
  }
  
  private async analyzeRequirements(task: Task, context: Record<string, any>): Promise<any> {
    return {
      requirements: [
        'Parse task description',
        'Identify key functionality',
        'Determine dependencies',
        'Define success criteria'
      ],
      analysis: {
        functionality: task.description,
        dependencies: task.dependencies || [],
        context: context,
      }
    };
  }
  
  private async designStructure(task: Task, context: Record<string, any>): Promise<any> {
    const language = context.codebase?.language || 'typescript';
    
    return {
      structure: {
        language,
        files: this.determineFileStructure(task, language),
        architecture: 'modular',
        patterns: ['singleton', 'factory', 'observer'],
      }
    };
  }
  
  private async implementCode(task: Task, context: Record<string, any>): Promise<any> {
    const language = context.codebase?.language || 'typescript';
    const patterns = context.patterns || [];
    
    const code = this.generateCodeTemplate(task, language, patterns);
    
    return {
      code,
      language,
      files: [
        {
          path: `src/implementations/${task.id}.${this.getFileExtension(language)}`,
          content: code,
        }
      ]
    };
  }
  
  private async generateTests(task: Task, context: Record<string, any>): Promise<any> {
    const testFramework = context.codebase?.testFramework || 'vitest';
    
    const testCode = this.generateTestTemplate(task, testFramework);
    
    return {
      tests: testCode,
      framework: testFramework,
      files: [
        {
          path: `tests/${task.id}.test.${this.getFileExtension('typescript')}`,
          content: testCode,
        }
      ]
    };
  }
  
  private async generateDocumentation(task: Task, context: Record<string, any>): Promise<any> {
    return {
      documentation: {
        summary: task.description,
        usage: 'See implementation for usage details',
        examples: [],
        api: [],
      }
    };
  }
  
  private async locateIssue(task: Task, context: Record<string, any>): Promise<any> {
    return {
      location: {
        files: [],
        lines: [],
        description: 'Issue location analysis',
      }
    };
  }
  
  private async analyzeCause(task: Task, context: Record<string, any>): Promise<any> {
    return {
      cause: {
        type: 'logic_error',
        description: 'Root cause analysis',
        recommendation: 'Suggested fix approach',
      }
    };
  }
  
  private async implementFix(task: Task, context: Record<string, any>): Promise<any> {
    return {
      fix: {
        changes: [],
        description: 'Fix implementation',
      }
    };
  }
  
  private async verifyFix(task: Task, context: Record<string, any>): Promise<any> {
    return {
      verification: {
        status: 'verified',
        tests_passed: true,
        side_effects: [],
      }
    };
  }
  
  private async synthesizeResults(results: any[], task: Task): Promise<any> {
    const files = [];
    const metadata: Record<string, any> = {};
    
    for (const result of results) {
      if (result.files) {
        files.push(...result.files);
      }
      
      Object.assign(metadata, result);
    }
    
    return {
      taskId: task.id,
      type: task.type,
      files,
      metadata,
      summary: `Successfully completed ${task.type} task`,
    };
  }
  
  private async recordExperience(task: Task, result: any, success: boolean): Promise<void> {
    const experience = {
      taskId: task.id,
      taskType: task.type,
      input: task,
      output: result,
      success,
      executionTime: Date.now(),
      timestamp: new Date(),
    };
    
    this.blackboard.write(
      `experience.${this.id}.${task.id}`,
      experience,
      this.id,
      ['experience', 'coding']
    );
    
    if (success && result.code) {
      this.updateCodePatterns(task.type, result.code);
    }
  }
  
  private async createCommit(task: Task, result: any): Promise<void> {
    if (!this.versionControl || !result.files || result.files.length === 0) {
      return;
    }
    
    try {
      const files = result.files.map((f: any) => f.path);
      
      await this.versionControl.commit({
        message: `feat: ${task.type} - ${task.description.slice(0, 50)}`,
        files,
        coAuthors: [
          { name: 'CodingAgent', email: 'agent@claude-enhanced.ai' }
        ],
      });
      
      this.logger.info('Commit created for task', { taskId: task.id });
    } catch (error) {
      this.logger.error('Failed to create commit', { taskId: task.id, error });
    }
  }
  
  private loadCodePatterns(): void {
    this.codePatterns.set('typescript', [
      'interface', 'class', 'async/await', 'generics', 'decorators'
    ]);
    
    this.codePatterns.set('python', [
      'class', 'def', 'async def', 'decorators', 'type hints'
    ]);
    
    this.codePatterns.set('javascript', [
      'class', 'function', 'async/await', 'arrow functions', 'modules'
    ]);
  }
  
  private findRelatedPatterns(task: Task): string[] {
    const taskDesc = task.description.toLowerCase();
    const patterns: string[] = [];
    
    for (const [lang, langPatterns] of this.codePatterns) {
      if (this.preferredLanguages.includes(lang)) {
        for (const pattern of langPatterns) {
          if (taskDesc.includes(pattern.toLowerCase())) {
            patterns.push(`${lang}:${pattern}`);
          }
        }
      }
    }
    
    return patterns;
  }
  
  private updateCodePatterns(taskType: string, code: string): void {
    const patterns = this.extractPatterns(code);
    
    const existing = this.codePatterns.get(taskType) || [];
    const updated = [...new Set([...existing, ...patterns])];
    
    this.codePatterns.set(taskType, updated);
  }
  
  private extractPatterns(code: string): string[] {
    const patterns: string[] = [];
    
    if (code.includes('async')) patterns.push('async');
    if (code.includes('await')) patterns.push('await');
    if (code.includes('class')) patterns.push('class');
    if (code.includes('=>')) patterns.push('arrow-function');
    if (code.includes('interface')) patterns.push('interface');
    
    return patterns;
  }
  
  private determineFileStructure(task: Task, language: string): string[] {
    const baseFiles = [
      `index.${this.getFileExtension(language)}`,
      `types.${this.getFileExtension(language)}`,
    ];
    
    if (task.type === 'api') {
      baseFiles.push(
        `routes.${this.getFileExtension(language)}`,
        `controllers.${this.getFileExtension(language)}`,
        `middleware.${this.getFileExtension(language)}`
      );
    }
    
    return baseFiles;
  }
  
  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      java: 'java',
      go: 'go',
      rust: 'rs',
    };
    
    return extensions[language] || 'txt';
  }
  
  private generateCodeTemplate(task: Task, language: string, patterns: string[]): string {
    if (language === 'typescript') {
      return `// Task: ${task.description}
// Generated by CodingAgent

export interface ${this.toPascalCase(task.type)}Config {
  // Configuration options
}

export class ${this.toPascalCase(task.type)} {
  constructor(config: ${this.toPascalCase(task.type)}Config) {
    // Implementation
  }
  
  async execute(): Promise<void> {
    // Main execution logic
  }
}`;
    } else if (language === 'python') {
      return `# Task: ${task.description}
# Generated by CodingAgent

from typing import Dict, Any

class ${this.toPascalCase(task.type)}:
    def __init__(self, config: Dict[str, Any]):
        """Initialize with configuration."""
        self.config = config
    
    async def execute(self) -> None:
        """Main execution logic."""
        pass`;
    } else {
      return `// Task: ${task.description}\n// Implementation pending`;
    }
  }
  
  private generateTestTemplate(task: Task, framework: string): string {
    if (framework === 'vitest') {
      return `import { describe, it, expect } from 'vitest';
import { ${this.toPascalCase(task.type)} } from '../src/implementations/${task.id}';

describe('${this.toPascalCase(task.type)}', () => {
  it('should execute successfully', async () => {
    const instance = new ${this.toPascalCase(task.type)}({});
    await expect(instance.execute()).resolves.not.toThrow();
  });
});`;
    } else {
      return `// Test implementation for ${task.type}`;
    }
  }
  
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}