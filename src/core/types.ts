import { z } from 'zod';

export enum AgentRole {
  ARCHITECT = 'architect',
  ANALYST = 'analyst',
  DESIGNER = 'designer',
  CODER = 'coder',
  REFACTOR = 'refactor',
  DEBUG = 'debug',
  REVIEWER = 'reviewer',
  TESTER = 'tester',
  SECURITY = 'security',
}

export enum AgentStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  ERROR = 'error',
  TERMINATED = 'terminated',
}

export enum MessageType {
  TASK = 'task',
  RESULT = 'result',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
  CONTROL = 'control',
}

export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export const TaskSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  priority: z.nativeEnum(TaskPriority),
  context: z.record(z.any()).optional(),
  dependencies: z.array(z.string()).optional(),
  timeout: z.number().optional(),
  retryPolicy: z.object({
    maxRetries: z.number(),
    backoffMs: z.number(),
  }).optional(),
  createdAt: z.date(),
  assignedAgent: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(MessageType),
  from: z.string(),
  to: z.string(),
  payload: z.any(),
  timestamp: z.date(),
  correlationId: z.string().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema?: z.ZodSchema;
  outputSchema?: z.ZodSchema;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageExecutionTime: number;
  successRate: number;
  lastActivityTime: Date;
}

export interface ExperienceEntry {
  taskId: string;
  taskType: string;
  input: any;
  output: any;
  success: boolean;
  executionTime: number;
  errorMessage?: string;
  feedback?: string;
  timestamp: Date;
}

export interface GitContext {
  branch: string;
  lastCommit: string;
  uncommittedChanges: string[];
  remoteUrl?: string;
  authorEmail?: string;
  authorName?: string;
}

export interface CodebaseContext {
  rootPath: string;
  language: string;
  framework?: string;
  dependencies: Record<string, string>;
  testFramework?: string;
  buildTool?: string;
  gitContext?: GitContext;
}