import simpleGit, { SimpleGit, SimpleGitOptions, StatusResult, LogResult, DiffResult } from 'simple-git';
import { EventEmitter } from 'eventemitter3';
import winston from 'winston';
import { GitContext } from '../core/types.js';

export interface CommitOptions {
  message: string;
  files?: string[];
  author?: { name: string; email: string };
  coAuthors?: { name: string; email: string }[];
  amend?: boolean;
  noVerify?: boolean;
}

export interface BranchOptions {
  from?: string;
  checkout?: boolean;
  track?: boolean;
}

export interface GitAnalysis {
  branch: string;
  isClean: boolean;
  ahead: number;
  behind: number;
  conflicts: string[];
  uncommittedChanges: {
    staged: string[];
    unstaged: string[];
    untracked: string[];
  };
  recentCommits: Array<{
    hash: string;
    author: string;
    date: Date;
    message: string;
  }>;
}

export class VersionControl extends EventEmitter {
  private git: SimpleGit;
  private logger: winston.Logger;
  private rootPath: string;
  
  constructor(rootPath: string, options?: Partial<SimpleGitOptions>) {
    super();
    
    this.rootPath = rootPath;
    this.git = simpleGit(rootPath, options);
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [VersionControl] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/version-control.log' }),
        new winston.transports.Console({
          format: winston.format.colorize({ all: true }),
        }),
      ],
    });
    
    this.logger.info('Version control initialized', { rootPath });
  }
  
  public async getContext(): Promise<GitContext> {
    try {
      const [branch, lastCommit, status, remotes, config] = await Promise.all([
        this.git.revparse(['--abbrev-ref', 'HEAD']),
        this.git.revparse(['HEAD']),
        this.git.status(),
        this.git.getRemotes(true),
        this.git.listConfig(),
      ]);
      
      const uncommittedChanges = [
        ...status.modified,
        ...status.created,
        ...status.deleted,
        ...status.renamed.map(r => r.to),
      ];
      
      const context: GitContext = {
        branch: branch.trim(),
        lastCommit: lastCommit.trim(),
        uncommittedChanges,
        remoteUrl: remotes[0]?.refs?.fetch,
        authorEmail: config.all['user.email']?.toString(),
        authorName: config.all['user.name']?.toString(),
      };
      
      return context;
    } catch (error) {
      this.logger.error('Failed to get git context', { error });
      throw error;
    }
  }
  
  public async analyzeRepository(): Promise<GitAnalysis> {
    try {
      const [status, log, branch, remoteInfo] = await Promise.all([
        this.git.status(),
        this.git.log(['--oneline', '-10']),
        this.git.revparse(['--abbrev-ref', 'HEAD']),
        this.git.revparse(['--abbrev-ref', '@{u}'])
          .then(() => this.git.revList(['--left-right', '--count', 'HEAD...@{u}']))
          .catch(() => '0\t0'),
      ]);
      
      const [ahead, behind] = remoteInfo.split('\t').map(Number);
      
      const analysis: GitAnalysis = {
        branch: branch.trim(),
        isClean: status.isClean(),
        ahead,
        behind,
        conflicts: status.conflicted,
        uncommittedChanges: {
          staged: status.staged,
          unstaged: [...status.modified, ...status.deleted],
          untracked: status.not_added,
        },
        recentCommits: log.all.map(commit => ({
          hash: commit.hash,
          author: commit.author_name || '',
          date: new Date(commit.date),
          message: commit.message,
        })),
      };
      
      this.logger.debug('Repository analyzed', { 
        branch: analysis.branch,
        isClean: analysis.isClean,
        ahead: analysis.ahead,
        behind: analysis.behind,
      });
      
      return analysis;
    } catch (error) {
      this.logger.error('Failed to analyze repository', { error });
      throw error;
    }
  }
  
  public async createBranch(name: string, options?: BranchOptions): Promise<void> {
    try {
      const fromBranch = options?.from || 'HEAD';
      
      await this.git.checkoutBranch(name, fromBranch);
      
      if (options?.track) {
        await this.git.branch(['--set-upstream-to', `origin/${name}`, name]);
      }
      
      this.logger.info('Branch created', { name, from: fromBranch });
      this.emit('branchCreated', { name, from: fromBranch });
    } catch (error) {
      this.logger.error('Failed to create branch', { name, error });
      throw error;
    }
  }
  
  public async commit(options: CommitOptions): Promise<string> {
    try {
      if (options.files && options.files.length > 0) {
        await this.git.add(options.files);
      }
      
      let message = options.message;
      
      if (options.coAuthors && options.coAuthors.length > 0) {
        message += '\n\n';
        for (const coAuthor of options.coAuthors) {
          message += `Co-authored-by: ${coAuthor.name} <${coAuthor.email}>\n`;
        }
      }
      
      const commitOptions: string[] = [];
      
      if (options.amend) {
        commitOptions.push('--amend');
      }
      
      if (options.noVerify) {
        commitOptions.push('--no-verify');
      }
      
      if (options.author) {
        commitOptions.push('--author', `${options.author.name} <${options.author.email}>`);
      }
      
      const result = await this.git.commit(message, undefined, commitOptions);
      
      this.logger.info('Commit created', { 
        hash: result.commit,
        message: options.message.split('\n')[0],
      });
      
      this.emit('commitCreated', { 
        hash: result.commit,
        message: options.message,
      });
      
      return result.commit;
    } catch (error) {
      this.logger.error('Failed to create commit', { error });
      throw error;
    }
  }
  
  public async stageChanges(patterns: string[]): Promise<void> {
    try {
      await this.git.add(patterns);
      this.logger.info('Changes staged', { patterns });
    } catch (error) {
      this.logger.error('Failed to stage changes', { patterns, error });
      throw error;
    }
  }
  
  public async getFileDiff(file?: string): Promise<string> {
    try {
      const args = ['--no-color'];
      if (file) {
        args.push('--', file);
      }
      
      const diff = await this.git.diff(args);
      return diff;
    } catch (error) {
      this.logger.error('Failed to get diff', { file, error });
      throw error;
    }
  }
  
  public async getStagedDiff(file?: string): Promise<string> {
    try {
      const args = ['--cached', '--no-color'];
      if (file) {
        args.push('--', file);
      }
      
      const diff = await this.git.diff(args);
      return diff;
    } catch (error) {
      this.logger.error('Failed to get staged diff', { file, error });
      throw error;
    }
  }
  
  public async getFileHistory(file: string, limit: number = 10): Promise<LogResult> {
    try {
      const log = await this.git.log({
        file,
        maxCount: limit,
      });
      
      return log;
    } catch (error) {
      this.logger.error('Failed to get file history', { file, error });
      throw error;
    }
  }
  
  public async blame(file: string): Promise<string> {
    try {
      const blame = await this.git.raw(['blame', '--line-porcelain', file]);
      return blame;
    } catch (error) {
      this.logger.error('Failed to get blame', { file, error });
      throw error;
    }
  }
  
  public async findChangedFiles(baseBranch: string = 'main'): Promise<string[]> {
    try {
      const diff = await this.git.diff(['--name-only', `${baseBranch}...HEAD`]);
      return diff.split('\n').filter(f => f.length > 0);
    } catch (error) {
      this.logger.error('Failed to find changed files', { baseBranch, error });
      throw error;
    }
  }
  
  public async getConflictedFiles(): Promise<string[]> {
    try {
      const status = await this.git.status();
      return status.conflicted;
    } catch (error) {
      this.logger.error('Failed to get conflicted files', { error });
      throw error;
    }
  }
  
  public async resolveConflict(file: string, resolution: 'ours' | 'theirs'): Promise<void> {
    try {
      if (resolution === 'ours') {
        await this.git.checkout(['--ours', file]);
      } else {
        await this.git.checkout(['--theirs', file]);
      }
      
      await this.git.add(file);
      
      this.logger.info('Conflict resolved', { file, resolution });
    } catch (error) {
      this.logger.error('Failed to resolve conflict', { file, resolution, error });
      throw error;
    }
  }
  
  public async createStash(message?: string): Promise<void> {
    try {
      const args = ['push'];
      if (message) {
        args.push('-m', message);
      }
      
      await this.git.stash(args);
      this.logger.info('Stash created', { message });
    } catch (error) {
      this.logger.error('Failed to create stash', { error });
      throw error;
    }
  }
  
  public async applyStash(index: number = 0): Promise<void> {
    try {
      await this.git.stash(['apply', `stash@{${index}}`]);
      this.logger.info('Stash applied', { index });
    } catch (error) {
      this.logger.error('Failed to apply stash', { index, error });
      throw error;
    }
  }
  
  public async cherryPick(commits: string[]): Promise<void> {
    try {
      await this.git.raw(['cherry-pick', ...commits]);
      this.logger.info('Cherry-pick completed', { commits });
    } catch (error) {
      this.logger.error('Failed to cherry-pick', { commits, error });
      throw error;
    }
  }
  
  public async rebase(onto: string, interactive: boolean = false): Promise<void> {
    try {
      const args = ['rebase'];
      if (interactive) {
        this.logger.warn('Interactive rebase requested but not supported in automated mode');
        throw new Error('Interactive rebase not supported in automated mode');
      }
      
      args.push(onto);
      await this.git.rebase(args);
      
      this.logger.info('Rebase completed', { onto });
    } catch (error) {
      this.logger.error('Failed to rebase', { onto, error });
      throw error;
    }
  }
  
  public async getTags(): Promise<string[]> {
    try {
      const tags = await this.git.tags();
      return tags.all;
    } catch (error) {
      this.logger.error('Failed to get tags', { error });
      throw error;
    }
  }
  
  public async createTag(name: string, message?: string): Promise<void> {
    try {
      const args = [name];
      if (message) {
        args.push('-m', message);
      }
      
      await this.git.tag(args);
      this.logger.info('Tag created', { name, message });
    } catch (error) {
      this.logger.error('Failed to create tag', { name, error });
      throw error;
    }
  }
  
  public async push(options?: { force?: boolean; tags?: boolean }): Promise<void> {
    try {
      const args: string[] = [];
      
      if (options?.force) {
        args.push('--force-with-lease');
      }
      
      if (options?.tags) {
        args.push('--tags');
      }
      
      await this.git.push(args);
      this.logger.info('Push completed', { options });
    } catch (error) {
      this.logger.error('Failed to push', { error });
      throw error;
    }
  }
  
  public async pull(options?: { rebase?: boolean }): Promise<void> {
    try {
      const args: string[] = [];
      
      if (options?.rebase) {
        args.push('--rebase');
      }
      
      await this.git.pull(args);
      this.logger.info('Pull completed', { options });
    } catch (error) {
      this.logger.error('Failed to pull', { error });
      throw error;
    }
  }
}