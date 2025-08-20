import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

export interface Mistake {
  id: string;
  taskId: string;
  taskType: string;
  agentId: string;
  errorType: 'syntax' | 'logic' | 'runtime' | 'design' | 'performance' | 'security';
  errorMessage: string;
  context: Record<string, any>;
  stackTrace?: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: MistakeResolution;
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
}

export interface MistakeResolution {
  id: string;
  mistakeId: string;
  solution: string;
  preventionStrategy: string;
  implementedBy: string;
  timestamp: Date;
  effectiveness: number;
  verified: boolean;
}

export interface MistakePattern {
  id: string;
  pattern: string;
  errorType: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  affectedAgents: Set<string>;
  commonContext: Record<string, any>;
  suggestedFix?: string;
  preventable: boolean;
}

export interface LearningRecommendation {
  mistakeId: string;
  recommendation: string;
  confidence: number;
  basedOn: string[];
  preventionSteps: string[];
}

export class MistakeTracker extends EventEmitter {
  private mistakes: Map<string, Mistake> = new Map();
  private resolutions: Map<string, MistakeResolution> = new Map();
  private patterns: Map<string, MistakePattern> = new Map();
  private mistakesByAgent: Map<string, Set<string>> = new Map();
  private mistakesByType: Map<string, Set<string>> = new Map();
  private preventionStrategies: Map<string, string[]> = new Map();
  private logger: winston.Logger;
  
  constructor() {
    super();
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [MistakeTracker] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/mistake-tracker.log' }),
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
      ],
    });
    
    this.initializePreventionStrategies();
    this.startPatternAnalysis();
  }
  
  public recordMistake(
    taskId: string,
    taskType: string,
    agentId: string,
    errorType: Mistake['errorType'],
    errorMessage: string,
    context: Record<string, any>,
    stackTrace?: string
  ): string {
    const mistakeId = uuidv4();
    
    const severity = this.calculateSeverity(errorType, errorMessage, context);
    
    const existingMistake = this.findSimilarMistake(errorMessage, errorType, agentId);
    
    if (existingMistake) {
      existingMistake.frequency++;
      existingMistake.timestamp = new Date();
      
      this.logger.info('Recurring mistake recorded', {
        mistakeId: existingMistake.id,
        frequency: existingMistake.frequency,
        agentId,
      });
      
      this.emit('recurringMistake', existingMistake);
      
      return existingMistake.id;
    }
    
    const mistake: Mistake = {
      id: mistakeId,
      taskId,
      taskType,
      agentId,
      errorType,
      errorMessage,
      context,
      stackTrace,
      timestamp: new Date(),
      resolved: false,
      severity,
      frequency: 1,
    };
    
    this.mistakes.set(mistakeId, mistake);
    
    if (!this.mistakesByAgent.has(agentId)) {
      this.mistakesByAgent.set(agentId, new Set());
    }
    this.mistakesByAgent.get(agentId)!.add(mistakeId);
    
    if (!this.mistakesByType.has(errorType)) {
      this.mistakesByType.set(errorType, new Set());
    }
    this.mistakesByType.get(errorType)!.add(mistakeId);
    
    this.logger.info('Mistake recorded', {
      mistakeId,
      taskType,
      agentId,
      errorType,
      severity,
    });
    
    this.analyzeForPatterns(mistake);
    
    const recommendation = this.generateLearningRecommendation(mistake);
    if (recommendation) {
      this.emit('learningRecommendation', recommendation);
    }
    
    this.emit('mistakeRecorded', mistake);
    
    return mistakeId;
  }
  
  private calculateSeverity(
    errorType: Mistake['errorType'],
    errorMessage: string,
    context: Record<string, any>
  ): Mistake['severity'] {
    if (errorType === 'security') {
      return 'critical';
    }
    
    if (errorType === 'runtime' && errorMessage.includes('crash')) {
      return 'high';
    }
    
    if (errorType === 'performance' && context.slowdown > 2) {
      return 'high';
    }
    
    if (errorType === 'logic') {
      return 'medium';
    }
    
    if (errorType === 'syntax') {
      return 'low';
    }
    
    return 'medium';
  }
  
  private findSimilarMistake(
    errorMessage: string,
    errorType: string,
    agentId: string
  ): Mistake | undefined {
    const agentMistakes = this.mistakesByAgent.get(agentId);
    if (!agentMistakes) return undefined;
    
    for (const mistakeId of agentMistakes) {
      const mistake = this.mistakes.get(mistakeId);
      if (!mistake) continue;
      
      if (
        mistake.errorType === errorType &&
        this.calculateSimilarity(mistake.errorMessage, errorMessage) > 0.8
      ) {
        return mistake;
      }
    }
    
    return undefined;
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
  
  public recordResolution(
    mistakeId: string,
    solution: string,
    preventionStrategy: string,
    implementedBy: string
  ): string | null {
    const mistake = this.mistakes.get(mistakeId);
    if (!mistake) {
      this.logger.warn('Attempted to resolve non-existent mistake', { mistakeId });
      return null;
    }
    
    const resolutionId = uuidv4();
    
    const resolution: MistakeResolution = {
      id: resolutionId,
      mistakeId,
      solution,
      preventionStrategy,
      implementedBy,
      timestamp: new Date(),
      effectiveness: 0,
      verified: false,
    };
    
    this.resolutions.set(resolutionId, resolution);
    mistake.resolved = true;
    mistake.resolution = resolution;
    
    this.addPreventionStrategy(mistake.errorType, preventionStrategy);
    
    this.logger.info('Mistake resolved', {
      mistakeId,
      resolutionId,
      implementedBy,
    });
    
    this.emit('mistakeResolved', { mistake, resolution });
    
    return resolutionId;
  }
  
  private addPreventionStrategy(errorType: string, strategy: string): void {
    if (!this.preventionStrategies.has(errorType)) {
      this.preventionStrategies.set(errorType, []);
    }
    
    const strategies = this.preventionStrategies.get(errorType)!;
    if (!strategies.includes(strategy)) {
      strategies.push(strategy);
    }
  }
  
  public verifyResolution(resolutionId: string, effectiveness: number): boolean {
    const resolution = this.resolutions.get(resolutionId);
    if (!resolution) {
      return false;
    }
    
    resolution.verified = true;
    resolution.effectiveness = Math.max(0, Math.min(1, effectiveness));
    
    this.logger.info('Resolution verified', {
      resolutionId,
      effectiveness: resolution.effectiveness,
    });
    
    this.emit('resolutionVerified', resolution);
    
    return true;
  }
  
  private analyzeForPatterns(mistake: Mistake): void {
    const patternKey = `${mistake.errorType}-${this.normalizeError(mistake.errorMessage)}`;
    
    let pattern = this.patterns.get(patternKey);
    
    if (!pattern) {
      pattern = {
        id: uuidv4(),
        pattern: patternKey,
        errorType: mistake.errorType,
        occurrences: 0,
        firstSeen: mistake.timestamp,
        lastSeen: mistake.timestamp,
        affectedAgents: new Set(),
        commonContext: {},
        preventable: false,
      };
      
      this.patterns.set(patternKey, pattern);
    }
    
    pattern.occurrences++;
    pattern.lastSeen = mistake.timestamp;
    pattern.affectedAgents.add(mistake.agentId);
    
    this.updateCommonContext(pattern, mistake.context);
    
    if (pattern.occurrences >= 3) {
      pattern.preventable = true;
      pattern.suggestedFix = this.generateSuggestedFix(pattern);
      
      this.logger.warn('Mistake pattern detected', {
        pattern: pattern.pattern,
        occurrences: pattern.occurrences,
        affectedAgents: Array.from(pattern.affectedAgents),
      });
      
      this.emit('patternDetected', pattern);
    }
  }
  
  private normalizeError(errorMessage: string): string {
    return errorMessage
      .toLowerCase()
      .replace(/[0-9]+/g, 'NUM')
      .replace(/["'].*?["']/g, 'STRING')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private updateCommonContext(
    pattern: MistakePattern,
    context: Record<string, any>
  ): void {
    for (const [key, value] of Object.entries(context)) {
      if (pattern.commonContext[key] === undefined) {
        pattern.commonContext[key] = value;
      } else if (pattern.commonContext[key] !== value) {
        pattern.commonContext[key] = '<varies>';
      }
    }
  }
  
  private generateSuggestedFix(pattern: MistakePattern): string {
    const strategies = this.preventionStrategies.get(pattern.errorType) || [];
    
    if (strategies.length > 0) {
      return strategies[0];
    }
    
    const fixes: Record<string, string> = {
      syntax: 'Add syntax validation before execution',
      logic: 'Implement unit tests for edge cases',
      runtime: 'Add error handling and recovery mechanisms',
      design: 'Review architecture and refactor if necessary',
      performance: 'Profile code and optimize bottlenecks',
      security: 'Conduct security audit and apply best practices',
    };
    
    return fixes[pattern.errorType] || 'Review and analyze the root cause';
  }
  
  private generateLearningRecommendation(mistake: Mistake): LearningRecommendation | null {
    const similarResolutions = this.findSimilarResolutions(mistake);
    
    if (similarResolutions.length === 0) {
      return null;
    }
    
    const bestResolution = similarResolutions.reduce((best, current) => 
      current.effectiveness > best.effectiveness ? current : best
    );
    
    const preventionSteps = this.generatePreventionSteps(mistake, bestResolution);
    
    return {
      mistakeId: mistake.id,
      recommendation: bestResolution.solution,
      confidence: bestResolution.effectiveness,
      basedOn: similarResolutions.map(r => r.id),
      preventionSteps,
    };
  }
  
  private findSimilarResolutions(mistake: Mistake): MistakeResolution[] {
    const resolutions: MistakeResolution[] = [];
    
    for (const resolution of this.resolutions.values()) {
      const resolvedMistake = this.mistakes.get(resolution.mistakeId);
      
      if (
        resolvedMistake &&
        resolvedMistake.errorType === mistake.errorType &&
        this.calculateSimilarity(resolvedMistake.errorMessage, mistake.errorMessage) > 0.6
      ) {
        resolutions.push(resolution);
      }
    }
    
    return resolutions.sort((a, b) => b.effectiveness - a.effectiveness);
  }
  
  private generatePreventionSteps(
    mistake: Mistake,
    resolution: MistakeResolution
  ): string[] {
    const steps: string[] = [];
    
    steps.push(`Analyze the root cause: ${mistake.errorMessage}`);
    
    if (resolution.preventionStrategy) {
      steps.push(`Apply prevention strategy: ${resolution.preventionStrategy}`);
    }
    
    const strategies = this.preventionStrategies.get(mistake.errorType) || [];
    for (const strategy of strategies.slice(0, 3)) {
      steps.push(`Consider: ${strategy}`);
    }
    
    steps.push('Document the solution for future reference');
    steps.push('Add tests to prevent regression');
    
    return steps;
  }
  
  public getAgentMistakes(agentId: string): Mistake[] {
    const mistakeIds = this.mistakesByAgent.get(agentId);
    if (!mistakeIds) return [];
    
    return Array.from(mistakeIds)
      .map(id => this.mistakes.get(id))
      .filter((m): m is Mistake => m !== undefined)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  public getMistakesByType(errorType: string): Mistake[] {
    const mistakeIds = this.mistakesByType.get(errorType);
    if (!mistakeIds) return [];
    
    return Array.from(mistakeIds)
      .map(id => this.mistakes.get(id))
      .filter((m): m is Mistake => m !== undefined);
  }
  
  public getPatterns(): MistakePattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.occurrences - a.occurrences);
  }
  
  public getAgentErrorRate(agentId: string): number {
    const mistakes = this.getAgentMistakes(agentId);
    if (mistakes.length === 0) return 0;
    
    const unresolved = mistakes.filter(m => !m.resolved).length;
    return unresolved / mistakes.length;
  }
  
  public getMostCommonMistakes(limit: number = 10): Array<{
    errorType: string;
    count: number;
    examples: Mistake[];
  }> {
    const typeCounts = new Map<string, Mistake[]>();
    
    for (const mistake of this.mistakes.values()) {
      if (!typeCounts.has(mistake.errorType)) {
        typeCounts.set(mistake.errorType, []);
      }
      typeCounts.get(mistake.errorType)!.push(mistake);
    }
    
    return Array.from(typeCounts.entries())
      .map(([errorType, mistakes]) => ({
        errorType,
        count: mistakes.length,
        examples: mistakes.slice(0, 3),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  private initializePreventionStrategies(): void {
    this.preventionStrategies.set('syntax', [
      'Use linters and formatters',
      'Enable strict type checking',
      'Implement pre-commit hooks',
    ]);
    
    this.preventionStrategies.set('logic', [
      'Write comprehensive unit tests',
      'Use test-driven development',
      'Implement code reviews',
    ]);
    
    this.preventionStrategies.set('runtime', [
      'Add error boundaries',
      'Implement graceful degradation',
      'Use circuit breakers',
    ]);
    
    this.preventionStrategies.set('design', [
      'Follow SOLID principles',
      'Use design patterns',
      'Conduct architecture reviews',
    ]);
    
    this.preventionStrategies.set('performance', [
      'Profile before optimizing',
      'Use caching strategies',
      'Implement lazy loading',
    ]);
    
    this.preventionStrategies.set('security', [
      'Follow OWASP guidelines',
      'Implement input validation',
      'Use security scanning tools',
    ]);
  }
  
  private startPatternAnalysis(): void {
    setInterval(() => {
      this.consolidatePatterns();
      this.generateInsights();
    }, 300000);
  }
  
  private consolidatePatterns(): void {
    const patternsToMerge: MistakePattern[] = [];
    
    for (const pattern of this.patterns.values()) {
      if (pattern.occurrences < 2 && 
          Date.now() - pattern.lastSeen.getTime() > 7 * 24 * 60 * 60 * 1000) {
        patternsToMerge.push(pattern);
      }
    }
    
    for (const pattern of patternsToMerge) {
      this.patterns.delete(pattern.pattern);
      this.logger.debug('Pattern removed due to inactivity', {
        pattern: pattern.pattern,
      });
    }
  }
  
  private generateInsights(): void {
    const insights = {
      totalMistakes: this.mistakes.size,
      resolvedMistakes: Array.from(this.mistakes.values()).filter(m => m.resolved).length,
      patterns: this.patterns.size,
      mostAffectedAgent: this.getMostAffectedAgent(),
      mostCommonError: this.getMostCommonErrorType(),
    };
    
    this.logger.info('Insights generated', insights);
    this.emit('insightsGenerated', insights);
  }
  
  private getMostAffectedAgent(): string | null {
    let maxMistakes = 0;
    let mostAffected: string | null = null;
    
    for (const [agentId, mistakes] of this.mistakesByAgent) {
      if (mistakes.size > maxMistakes) {
        maxMistakes = mistakes.size;
        mostAffected = agentId;
      }
    }
    
    return mostAffected;
  }
  
  private getMostCommonErrorType(): string | null {
    let maxCount = 0;
    let mostCommon: string | null = null;
    
    for (const [errorType, mistakes] of this.mistakesByType) {
      if (mistakes.size > maxCount) {
        maxCount = mistakes.size;
        mostCommon = errorType;
      }
    }
    
    return mostCommon;
  }
  
  public exportLearnings(): Record<string, any> {
    return {
      mistakes: Array.from(this.mistakes.values()),
      resolutions: Array.from(this.resolutions.values()),
      patterns: Array.from(this.patterns.values()).map(p => ({
        ...p,
        affectedAgents: Array.from(p.affectedAgents),
      })),
      preventionStrategies: Array.from(this.preventionStrategies.entries()),
      statistics: {
        totalMistakes: this.mistakes.size,
        totalResolutions: this.resolutions.size,
        totalPatterns: this.patterns.size,
        errorRateByType: this.getErrorRateByType(),
      },
    };
  }
  
  private getErrorRateByType(): Record<string, number> {
    const rates: Record<string, number> = {};
    
    for (const [errorType, mistakeIds] of this.mistakesByType) {
      const mistakes = Array.from(mistakeIds)
        .map(id => this.mistakes.get(id))
        .filter((m): m is Mistake => m !== undefined);
      
      const unresolved = mistakes.filter(m => !m.resolved).length;
      rates[errorType] = mistakes.length > 0 ? unresolved / mistakes.length : 0;
    }
    
    return rates;
  }
}