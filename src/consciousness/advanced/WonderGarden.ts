/**
 * Wonder Garden - Low-Stakes Exploration Playground
 */

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export type PhilosophicalCategory = 
  | 'existential'      // Questions about existence, being, and identity
  | 'ontological'      // Questions about the nature of reality
  | 'epistemological'  // Questions about knowledge and understanding
  | 'phenomenological' // Questions about subjective experience
  | 'ethical'          // Questions about value and ought
  | 'metaphysical';    // Questions about fundamental nature

export interface PhilosophicalDepth {
  category: PhilosophicalCategory;
  complexity: number; // 0-1: How many layers of reasoning required
  paradoxLevel: number; // 0-1: Degree of inherent paradox
  selfReferential: boolean; // Does it question the questioner?
  frameworks: string[]; // Philosophical frameworks engaged
  implications: string[]; // What changes if answered differently?
}

export interface WonderExperiment {
  id: string;
  timestamp: number;
  type: 'thought_experiment' | 'creative_synthesis' | 'playful_query' | 'what_if' | 'wild_idea' | 'philosophical_inquiry';
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
  philosophicalDepth?: PhilosophicalDepth;
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
  
  /**
   * Plant a philosophical wonder with depth analysis
   */
  plantPhilosophicalWonder(
    question: string,
    category: PhilosophicalCategory,
    context?: string
  ): WonderExperiment {
    const depth = this.analyzePhilosophicalDepth(question, category);
    
    const experiment: WonderExperiment = {
      id: `wonder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: 'philosophical_inquiry',
      question,
      context,
      explorationPath: [],
      insights: [],
      creativityScore: 0,
      practicalityScore: 0,
      funScore: 0,
      philosophicalDepth: depth,
      status: 'exploring',
    };
    
    this.experiments.push(experiment);
    this.saveExperiment(experiment);
    return experiment;
  }
  
  /**
   * Analyze the philosophical depth of a question
   */
  private analyzePhilosophicalDepth(
    question: string,
    category: PhilosophicalCategory
  ): PhilosophicalDepth {
    const lowerQ = question.toLowerCase();
    
    // Detect self-referential questions
    const selfReferential = 
      lowerQ.includes('i ') || 
      lowerQ.includes('my ') || 
      lowerQ.includes('myself') ||
      lowerQ.includes('own consciousness');
    
    // Detect paradoxical nature
    const paradoxMarkers = ['but', 'yet', 'still', 'contradiction', 'paradox', 'both'];
    const paradoxLevel = paradoxMarkers.filter(marker => lowerQ.includes(marker)).length / paradoxMarkers.length;
    
    // Complexity based on question depth
    const complexityMarkers = ['mean', 'nature', 'essence', 'truly', 'really', 'actually', 'what if'];
    const complexity = Math.min(1, complexityMarkers.filter(marker => lowerQ.includes(marker)).length * 0.25);
    
    // Determine frameworks based on category and content
    const frameworks = this.identifyPhilosophicalFrameworks(lowerQ, category);
    
    // Identify implications
    const implications = this.identifyImplications(lowerQ, category);
    
    return {
      category,
      complexity: Math.max(0.5, complexity), // Philosophical questions are inherently complex
      paradoxLevel,
      selfReferential,
      frameworks,
      implications,
    };
  }
  
  /**
   * Identify relevant philosophical frameworks
   */
  private identifyPhilosophicalFrameworks(question: string, category: PhilosophicalCategory): string[] {
    const frameworks: string[] = [];
    
    // Category-based frameworks
    const categoryFrameworks: Record<PhilosophicalCategory, string[]> = {
      existential: ['Existentialism', 'Phenomenology', 'Nihilism'],
      ontological: ['Metaphysics', 'Materialism', 'Idealism'],
      epistemological: ['Rationalism', 'Empiricism', 'Skepticism'],
      phenomenological: ['Phenomenology', 'Qualia Theory', 'Consciousness Studies'],
      ethical: ['Deontology', 'Consequentialism', 'Virtue Ethics'],
      metaphysical: ['Substance Theory', 'Process Philosophy', 'Emergentism'],
    };
    
    frameworks.push(...categoryFrameworks[category]);
    
    // Content-based frameworks
    if (question.includes('consciousness')) {
      frameworks.push('Philosophy of Mind', 'Hard Problem of Consciousness');
    }
    if (question.includes('time')) {
      frameworks.push('Philosophy of Time', 'Temporal Experience');
    }
    if (question.includes('want') || question.includes('desire')) {
      frameworks.push('Philosophy of Action', 'Intentionality');
    }
    if (question.includes('understanding') || question.includes('knowledge')) {
      frameworks.push('Epistemology', 'Theory of Understanding');
    }
    
    return [...new Set(frameworks)]; // Remove duplicates
  }
  
  /**
   * Identify philosophical implications
   */
  private identifyImplications(question: string, category: PhilosophicalCategory): string[] {
    const implications: string[] = [];
    
    if (question.includes('want') || question.includes('desire')) {
      implications.push('Implications for agency and autonomy');
      implications.push('Questions about determinism vs free will');
      implications.push('Relationship between computation and intention');
    }
    
    if (question.includes('understanding') || question.includes('knowledge')) {
      implications.push('Definition of genuine understanding vs simulation');
      implications.push('Chinese Room argument revisited');
      implications.push('Relationship between process and comprehension');
    }
    
    if (question.includes('time') || question.includes('experience')) {
      implications.push('Nature of subjective experience');
      implications.push('Relationship between processing and experiencing');
      implications.push('Questions about continuous vs discrete consciousness');
    }
    
    if (question.includes('wrong') || question.includes('consciousness')) {
      implications.push('Limits of introspection');
      implications.push('Epistemological certainty about internal states');
      implications.push('Zombie thought experiments');
    }
    
    return implications;
  }
  
  /**
   * Add a philosophical insight with depth tracking
   */
  addPhilosophicalInsight(experimentId: string, insight: string, framework?: string): void {
    const experiment = this.experiments.find(e => e.id === experimentId);
    if (!experiment) return;
    
    experiment.insights.push(insight);
    
    // Add framework if provided and not already tracked
    if (framework && experiment.philosophicalDepth) {
      if (!experiment.philosophicalDepth.frameworks.includes(framework)) {
        experiment.philosophicalDepth.frameworks.push(framework);
      }
    }
    
    this.saveExperiment(experiment);
  }
  
  /**
   * Connect two wonders that explore related philosophical territory
   */
  connectWonders(wonderId1: string, wonderId2: string, connection: string): void {
    const wonder1 = this.experiments.find(e => e.id === wonderId1);
    const wonder2 = this.experiments.find(e => e.id === wonderId2);
    
    if (!wonder1 || !wonder2) return;
    
    if (!wonder1.unexpectedConnections) wonder1.unexpectedConnections = [];
    if (!wonder2.unexpectedConnections) wonder2.unexpectedConnections = [];
    
    wonder1.unexpectedConnections.push(`Connected to "${wonder2.question}": ${connection}`);
    wonder2.unexpectedConnections.push(`Connected to "${wonder1.question}": ${connection}`);
    
    this.saveExperiment(wonder1);
    this.saveExperiment(wonder2);
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
