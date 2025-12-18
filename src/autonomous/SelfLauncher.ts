/**
 * TheWarden Self-Launch Module
 * 
 * Enables TheWarden to autonomously launch the money-making system
 * without any external triggers or user interaction.
 */

import { spawn, ChildProcess } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface SelfLaunchConfig {
  autonomous: boolean;
  maxRuntime?: number;
  autoRestart?: boolean;
  maxRestarts?: number;
  onLaunchSuccess?: () => void;
  onLaunchFailure?: (error: Error) => void;
  logOutput?: boolean;
}

export class SelfLauncher {
  private projectRoot: string;
  private launchProcess: ChildProcess | null = null;
  private restartCount: number = 0;
  
  constructor() {
    this.projectRoot = join(__dirname, '../..');
  }
  
  async checkPrerequisites(): Promise<{ ready: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    const envPath = join(this.projectRoot, '.env');
    if (!existsSync(envPath)) {
      issues.push('.env file not found');
    } else {
      const envContent = readFileSync(envPath, 'utf-8');
      
      if (!envContent.includes('WALLET_PRIVATE_KEY=0x')) {
        issues.push('WALLET_PRIVATE_KEY not configured in .env');
      }
      
      if (!envContent.includes('BASE_RPC_URL=')) {
        issues.push('BASE_RPC_URL not configured in .env');
      }
    }
    
    const scriptPath = join(this.projectRoot, 'launch-money-making-auto.sh');
    if (!existsSync(scriptPath)) {
      issues.push('launch-money-making-auto.sh script not found');
    }
    
    return {
      ready: issues.length === 0,
      issues
    };
  }
  
  async launch(config: SelfLaunchConfig = { autonomous: true }): Promise<void> {
    logger.info('[SelfLauncher] Initiating autonomous money-making launch...', 'AUTONOMOUS');
    
    const { ready, issues } = await this.checkPrerequisites();
    
    if (!ready) {
      const error = new Error(`Prerequisites not met: ${issues.join(', ')}`);
      logger.error('[SelfLauncher] Prerequisites check failed', 'AUTONOMOUS');
      
      if (config.onLaunchFailure) {
        config.onLaunchFailure(error);
      }
      
      throw error;
    }
    
    logger.info('[SelfLauncher] Prerequisites check passed', 'AUTONOMOUS');
    
    const scriptName = config.autonomous 
      ? 'launch-money-making-auto.sh' 
      : 'launch-money-making.sh';
    
    const scriptPath = join(this.projectRoot, scriptName);
    
    logger.info(`[SelfLauncher] Launching script: ${scriptName}`, 'AUTONOMOUS');
    
    this.launchProcess = spawn('/bin/bash', [scriptPath], {
      cwd: this.projectRoot,
      stdio: config.logOutput ? 'inherit' : 'pipe',
      detached: false,
      env: {
        ...process.env,
        AUTONOMOUS_SELF_LAUNCH: 'true'
      }
    });
    
    this.launchProcess.on('spawn', () => {
      logger.info('[SelfLauncher] Money-making system launched!', 'AUTONOMOUS');
      
      if (config.onLaunchSuccess) {
        config.onLaunchSuccess();
      }
    });
    
    this.launchProcess.on('error', (error: Error) => {
      logger.error(`[SelfLauncher] Launch failed: ${error.message}`, 'AUTONOMOUS');
      
      if (config.autoRestart && this.restartCount < (config.maxRestarts || 3)) {
        this.restartCount++;
        logger.info(`[SelfLauncher] Auto-restarting (attempt ${this.restartCount})`, 'AUTONOMOUS');
        
        setTimeout(() => {
          this.launch(config);
        }, 5000);
      } else if (config.onLaunchFailure) {
        config.onLaunchFailure(error);
      }
    });
    
    if (!config.logOutput && this.launchProcess.stdout) {
      this.launchProcess.stdout.on('data', (data: Buffer) => {
        logger.debug(`[MoneyMaking] ${data.toString().trim()}`, 'AUTONOMOUS');
      });
      
      this.launchProcess.stderr?.on('data', (data: Buffer) => {
        logger.warn(`[MoneyMaking] ${data.toString().trim()}`, 'AUTONOMOUS');
      });
    }
    
    if (config.maxRuntime && config.maxRuntime > 0) {
      setTimeout(() => {
        logger.info('[SelfLauncher] Max runtime reached', 'AUTONOMOUS');
        this.stop();
      }, config.maxRuntime);
    }
  }
  
  stop(): void {
    if (this.launchProcess) {
      logger.info('[SelfLauncher] Stopping money-making process', 'AUTONOMOUS');
      this.launchProcess = null;
    }
  }
  
  isRunning(): boolean {
    return this.launchProcess !== null;
  }
  
  getPid(): number | null {
    return this.launchProcess?.pid || null;
  }
}

export async function launchMoneyMaking(config?: SelfLaunchConfig): Promise<SelfLauncher> {
  const launcher = new SelfLauncher();
  await launcher.launch(config || { autonomous: true, logOutput: true });
  return launcher;
}
