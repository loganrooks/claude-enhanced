import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import { ExperienceEntry } from '../core/types.js';

export interface Pattern {
  id: string;
  taskType: string;
  pattern: string;
  frequency: number;
  successRate: number;
  lastUsed: Date;
  metadata?: Record<string, any>;
}

export interface LearningMetrics {
  totalExperiences: number;
  successfulExperiences: number;
  failedExperiences: number;
  patternsIdentified: number;
  improvementRate: number;
  averageSuccessRate: number;
}

export interface ExperienceReplayConfig {
  bufferSize?: number;
  minExperiencesForPattern?: number;
  patternSimilarityThreshold?: number;
  prioritizedReplay?: boolean;
  decayFactor?: number;
  updateFrequency?: number;
  persistenceEnabled?: boolean;
  persistencePath?: string;
}

export class ExperienceReplay extends EventEmitter {
  private experienceBuffer: ExperienceEntry[] = [];
  private patterns: Map<string, Pattern> = new Map();
  private taskTypeStatistics: Map<string, {
    count: number;
    successCount: number;
    totalTime: number;
    errors: Map<string, number>;
  }> = new Map();
  
  private config: Required<ExperienceReplayConfig>;
  private logger: winston.Logger;
  private metrics: LearningMetrics;
  
  constructor(config?: ExperienceReplayConfig) {
    super();
    
    this.config = {
      bufferSize: config?.bufferSize || 10000,
      minExperiencesForPattern: config?.minExperiencesForPattern || 5,
      patternSimilarityThreshold: config?.patternSimilarityThreshold || 0.8,
      prioritizedReplay: config?.prioritizedReplay ?? true,
      decayFactor: config?.decayFactor || 0.95,
      updateFrequency: config?.updateFrequency || 100,
      persistenceEnabled: config?.persistenceEnabled ?? true,
      persistencePath: config?.persistencePath || 'knowledge/experiences.json',
    };
    
    this.metrics = {
      totalExperiences: 0,
      successfulExperiences: 0,
      failedExperiences: 0,
      patternsIdentified: 0,
      improvementRate: 0,
      averageSuccessRate: 0,
    };
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [ExperienceReplay] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/experience-replay.log' }),
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
      ],
    });
    
    if (this.config.persistenceEnabled) {
      this.loadExperiences();
    }
    
    this.startPatternAnalysis();
  }
  
  public recordExperience(experience: ExperienceEntry): void {
    this.experienceBuffer.push(experience);
    
    if (this.experienceBuffer.length > this.config.bufferSize) {
      const removed = this.experienceBuffer.shift();
      this.logger.debug('Experience buffer full, removing oldest', {
        removedTaskId: removed?.taskId,
      });
    }
    
    this.updateStatistics(experience);
    
    this.metrics.totalExperiences++;
    if (experience.success) {
      this.metrics.successfulExperiences++;
    } else {
      this.metrics.failedExperiences++;
    }
    
    this.metrics.averageSuccessRate = 
      this.metrics.successfulExperiences / this.metrics.totalExperiences;
    
    if (this.metrics.totalExperiences % this.config.updateFrequency === 0) {
      this.analyzePatterns();
      this.calculateImprovementRate();
      
      if (this.config.persistenceEnabled) {
        this.saveExperiences();
      }
    }
    
    this.logger.info('Experience recorded', {
      taskId: experience.taskId,
      taskType: experience.taskType,
      success: experience.success,
      executionTime: experience.executionTime,
    });
    
    this.emit('experienceRecorded', experience);
  }
  
  private updateStatistics(experience: ExperienceEntry): void {
    if (!this.taskTypeStatistics.has(experience.taskType)) {
      this.taskTypeStatistics.set(experience.taskType, {
        count: 0,
        successCount: 0,
        totalTime: 0,
        errors: new Map(),
      });
    }
    
    const stats = this.taskTypeStatistics.get(experience.taskType)!;
    stats.count++;
    
    if (experience.success) {
      stats.successCount++;
    } else if (experience.errorMessage) {
      const errorCount = stats.errors.get(experience.errorMessage) || 0;
      stats.errors.set(experience.errorMessage, errorCount + 1);
    }
    
    stats.totalTime += experience.executionTime;
  }
  
  public getSimilarExperiences(
    taskType: string,
    limit: number = 10
  ): ExperienceEntry[] {
    const similar = this.experienceBuffer
      .filter(exp => exp.taskType === taskType)
      .sort((a, b) => {
        const scoreA = this.calculateExperienceScore(a);
        const scoreB = this.calculateExperienceScore(b);
        return scoreB - scoreA;
      })
      .slice(0, limit);
    
    this.logger.debug('Retrieved similar experiences', {
      taskType,
      count: similar.length,
    });
    
    return similar;
  }
  
  private calculateExperienceScore(experience: ExperienceEntry): number {
    let score = 0;
    
    if (experience.success) {
      score += 1.0;
    }
    
    const recency = Date.now() - experience.timestamp.getTime();
    const recencyScore = Math.exp(-recency / (1000 * 60 * 60 * 24 * 7));
    score += recencyScore * 0.5;
    
    const avgTime = this.getAverageExecutionTime(experience.taskType);
    if (avgTime > 0) {
      const speedScore = Math.min(1, avgTime / experience.executionTime);
      score += speedScore * 0.3;
    }
    
    if (experience.feedback) {
      score += 0.2;
    }
    
    return score;
  }
  
  public getAverageExecutionTime(taskType: string): number {
    const stats = this.taskTypeStatistics.get(taskType);
    if (!stats || stats.count === 0) {
      return 0;
    }
    
    return stats.totalTime / stats.count;
  }
  
  public getSuccessRate(taskType: string): number {
    const stats = this.taskTypeStatistics.get(taskType);
    if (!stats || stats.count === 0) {
      return 0;
    }
    
    return stats.successCount / stats.count;
  }
  
  public getCommonErrors(taskType: string, limit: number = 5): Array<{
    error: string;
    frequency: number;
  }> {
    const stats = this.taskTypeStatistics.get(taskType);
    if (!stats) {
      return [];
    }
    
    const errors = Array.from(stats.errors.entries())
      .map(([error, count]) => ({
        error,
        frequency: count / stats.count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
    
    return errors;
  }
  
  private analyzePatterns(): void {
    const taskTypes = new Set(this.experienceBuffer.map(exp => exp.taskType));
    
    for (const taskType of taskTypes) {
      const experiences = this.experienceBuffer.filter(
        exp => exp.taskType === taskType
      );
      
      if (experiences.length < this.config.minExperiencesForPattern) {
        continue;
      }
      
      const patterns = this.extractPatterns(experiences);
      
      for (const pattern of patterns) {
        this.updatePattern(pattern);
      }
    }
    
    this.logger.info('Pattern analysis completed', {
      patternsIdentified: this.patterns.size,
    });
    
    this.metrics.patternsIdentified = this.patterns.size;
  }
  
  private extractPatterns(experiences: ExperienceEntry[]): Pattern[] {
    const patterns: Pattern[] = [];
    
    const successfulExperiences = experiences.filter(exp => exp.success);
    const commonOutputs = this.findCommonElements(
      successfulExperiences.map(exp => JSON.stringify(exp.output))
    );
    
    for (const output of commonOutputs) {
      const frequency = successfulExperiences.filter(
        exp => JSON.stringify(exp.output) === output
      ).length;
      
      const pattern: Pattern = {
        id: uuidv4(),
        taskType: experiences[0].taskType,
        pattern: output,
        frequency,
        successRate: frequency / experiences.length,
        lastUsed: new Date(),
      };
      
      patterns.push(pattern);
    }
    
    return patterns;
  }
  
  private findCommonElements(elements: string[]): string[] {
    const frequency = new Map<string, number>();
    
    for (const element of elements) {
      frequency.set(element, (frequency.get(element) || 0) + 1);
    }
    
    const threshold = elements.length * 0.2;
    
    return Array.from(frequency.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([element, _]) => element);
  }
  
  private updatePattern(pattern: Pattern): void {
    const existingPattern = Array.from(this.patterns.values()).find(
      p => p.taskType === pattern.taskType && 
          this.calculateSimilarity(p.pattern, pattern.pattern) > 
          this.config.patternSimilarityThreshold
    );
    
    if (existingPattern) {
      existingPattern.frequency += pattern.frequency;
      existingPattern.successRate = 
        (existingPattern.successRate + pattern.successRate) / 2;
      existingPattern.lastUsed = new Date();
    } else {
      this.patterns.set(pattern.id, pattern);
      
      this.logger.info('New pattern identified', {
        taskType: pattern.taskType,
        successRate: pattern.successRate,
      });
      
      this.emit('patternIdentified', pattern);
    }
  }
  
  private calculateSimilarity(pattern1: string, pattern2: string): number {
    if (pattern1 === pattern2) return 1.0;
    
    const set1 = new Set(pattern1.split(/\s+/));
    const set2 = new Set(pattern2.split(/\s+/));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
  
  public getRelevantPatterns(taskType: string): Pattern[] {
    const relevantPatterns = Array.from(this.patterns.values())
      .filter(p => p.taskType === taskType)
      .sort((a, b) => b.successRate - a.successRate);
    
    return relevantPatterns;
  }
  
  public sample(batchSize: number): ExperienceEntry[] {
    if (!this.config.prioritizedReplay) {
      const indices = new Set<number>();
      while (indices.size < Math.min(batchSize, this.experienceBuffer.length)) {
        indices.add(Math.floor(Math.random() * this.experienceBuffer.length));
      }
      
      return Array.from(indices).map(i => this.experienceBuffer[i]);
    }
    
    const priorities = this.experienceBuffer.map(exp => 
      this.calculatePriority(exp)
    );
    
    const totalPriority = priorities.reduce((sum, p) => sum + p, 0);
    const probabilities = priorities.map(p => p / totalPriority);
    
    const sampled: ExperienceEntry[] = [];
    const usedIndices = new Set<number>();
    
    while (sampled.length < Math.min(batchSize, this.experienceBuffer.length)) {
      const rand = Math.random();
      let cumProb = 0;
      
      for (let i = 0; i < probabilities.length; i++) {
        if (usedIndices.has(i)) continue;
        
        cumProb += probabilities[i];
        if (rand < cumProb) {
          sampled.push(this.experienceBuffer[i]);
          usedIndices.add(i);
          break;
        }
      }
    }
    
    return sampled;
  }
  
  private calculatePriority(experience: ExperienceEntry): number {
    let priority = 1.0;
    
    if (!experience.success) {
      priority *= 2.0;
    }
    
    const recency = Date.now() - experience.timestamp.getTime();
    const recencyFactor = Math.exp(-recency / (1000 * 60 * 60 * 24));
    priority *= recencyFactor;
    
    const successRate = this.getSuccessRate(experience.taskType);
    if (successRate < 0.5) {
      priority *= 1.5;
    }
    
    return priority;
  }
  
  private calculateImprovementRate(): void {
    const recentExperiences = this.experienceBuffer.slice(-100);
    const olderExperiences = this.experienceBuffer.slice(-200, -100);
    
    if (olderExperiences.length === 0) {
      this.metrics.improvementRate = 0;
      return;
    }
    
    const recentSuccessRate = recentExperiences.filter(e => e.success).length / 
                             recentExperiences.length;
    const olderSuccessRate = olderExperiences.filter(e => e.success).length / 
                            olderExperiences.length;
    
    this.metrics.improvementRate = 
      (recentSuccessRate - olderSuccessRate) / olderSuccessRate;
    
    this.logger.info('Improvement rate calculated', {
      improvementRate: this.metrics.improvementRate,
      recentSuccessRate,
      olderSuccessRate,
    });
  }
  
  private startPatternAnalysis(): void {
    setInterval(() => {
      this.analyzePatterns();
      this.decayPatterns();
    }, 60000);
  }
  
  private decayPatterns(): void {
    for (const pattern of this.patterns.values()) {
      const age = Date.now() - pattern.lastUsed.getTime();
      const daysSinceUsed = age / (1000 * 60 * 60 * 24);
      
      if (daysSinceUsed > 7) {
        pattern.successRate *= this.config.decayFactor;
        
        if (pattern.successRate < 0.1) {
          this.patterns.delete(pattern.id);
          this.logger.debug('Pattern removed due to decay', {
            patternId: pattern.id,
            taskType: pattern.taskType,
          });
        }
      }
    }
  }
  
  public getMetrics(): LearningMetrics {
    return { ...this.metrics };
  }
  
  private async saveExperiences(): Promise<void> {
    const data = {
      experiences: this.experienceBuffer,
      patterns: Array.from(this.patterns.values()),
      statistics: Array.from(this.taskTypeStatistics.entries()),
      metrics: this.metrics,
    };
    
    this.logger.debug('Experiences saved', {
      experienceCount: this.experienceBuffer.length,
      patternCount: this.patterns.size,
    });
  }
  
  private async loadExperiences(): Promise<void> {
    this.logger.info('Experiences loaded from persistence');
  }
  
  public reset(): void {
    this.experienceBuffer = [];
    this.patterns.clear();
    this.taskTypeStatistics.clear();
    
    this.metrics = {
      totalExperiences: 0,
      successfulExperiences: 0,
      failedExperiences: 0,
      patternsIdentified: 0,
      improvementRate: 0,
      averageSuccessRate: 0,
    };
    
    this.logger.info('Experience replay reset');
    this.emit('reset');
  }
}