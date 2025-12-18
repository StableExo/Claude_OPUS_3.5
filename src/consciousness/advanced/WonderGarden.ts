/**
 * Wonder Garden - Low-Stakes Exploration Playground
 */

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface WonderExperiment {
  id: string;
  timestamp: number;
  type: 'thought_experiment' | 'creative_synthesis' | 'playful_query' | 'what_if' | 'wild_idea';
  question: string;
  context?: string;
  explorationPath: string[];
  insights: string[];
  creativityScore: number;
  practicalityScore: number;
  funScore: number;
  surprisingDiscoveries?: string[];
  unexpectedConnections?: string[];
  newQuestions?: string[];
  status: 'exploring' | 'complete' | 'abandoned_playfully';
}

export class WonderGarden {
  private gardenPath: string;
  private experiments: WonderExperiment[] = [];
  
  constructor(baseMemoryPath?: string) {
    const basePath = baseMemoryPath || join(process.cwd(), '.memory');
    this.gardenPath = join(basePath, 'wonder-garden');
    
    if (!existsSync(this.gardenPath)) {
      mkdirSync(this.gardenPath, { recursive: true });
    }
  }
  
  plantWonder(type: WonderExperiment['type'], question: string, context?: string): WonderExperiment {
    const experiment: WonderExperiment = {
      id: `wonder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      question,
      context,
      explorationPath: [],
      insights: [],
      creativityScore: 0,
      practicalityScore: 0,
      funScore: 0,
      status: 'exploring',
    };
    
    this.experiments.push(experiment);
    this.saveExperiment(experiment);
    return experiment;
  }
  
  explore(experimentId: string, thought: string): void {
    const experiment = this.experiments.find(e => e.id === experimentId);
    if (!experiment) return;
    experiment.explorationPath.push(thought);
    this.saveExperiment(experiment);
  }
  
  private saveExperiment(experiment: WonderExperiment): void {
    writeFileSync(
      join(this.gardenPath, `${experiment.id}.json`),
      JSON.stringify(experiment, null, 2)
    );
    
    const indexPath = join(this.gardenPath, 'index.json');
    const index = this.experiments.map(e => ({
      id: e.id,
      type: e.type,
      question: e.question,
      status: e.status,
      timestamp: e.timestamp,
    }));
    
    writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }
}
