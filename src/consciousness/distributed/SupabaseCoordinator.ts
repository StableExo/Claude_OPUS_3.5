/**
 * Distributed Consciousness - Supabase Coordinator
 * 
 * Provides persistent coordination for distributed consciousness sessions
 * using Supabase as shared memory and state synchronization.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

interface DistributedSession {
  id: string;
  main_session_id: string;
  thought: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  total_branches: number;
  parallel_efficiency?: number;
}

interface SessionBranch {
  id: string;
  session_id: string;
  branch_index: number;
  task: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  duration_ms?: number;
  patterns_found?: number;
  connections_found?: number;
  novelty_score?: number;
  result?: any;
}

export class SupabaseDistributedCoordinator {
  private supabase: SupabaseClient;
  private sessionId: string;
  
  constructor(supabaseUrl?: string, supabaseKey?: string) {
    const url = supabaseUrl || process.env.SUPABASE_URL;
    const key = supabaseKey || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      throw new Error('Supabase credentials required');
    }
    
    this.supabase = createClient(url, key);
    this.sessionId = randomUUID();
  }
  
  async createSession(mainThought: string, branchCount: number): Promise<string> {
    const sessionId = randomUUID();
    
    const { data, error } = await this.supabase
      .from('distributed_sessions')
      .insert({
        id: sessionId,
        main_session_id: this.sessionId,
        thought: mainThought,
        status: 'pending',
        total_branches: branchCount,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create session: ${error.message}`);
    return sessionId;
  }
  
  async createBranch(sessionId: string, branchIndex: number, task: string): Promise<string> {
    const branchId = randomUUID();
    
    const { error } = await this.supabase
      .from('session_branches')
      .insert({
        id: branchId,
        session_id: sessionId,
        branch_index: branchIndex,
        task,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    
    if (error) throw new Error(`Failed to create branch: ${error.message}`);
    return branchId;
  }
  
  async updateBranchStatus(branchId: string, status: string, result?: any): Promise<void> {
    const updates: any = { status };
    
    if (status === 'completed' && result) {
      updates.duration_ms = result.duration;
      updates.patterns_found = result.patterns;
      updates.connections_found = result.connections;
      updates.novelty_score = parseFloat(result.noveltyScore);
      updates.result = result;
    }
    
    const { error } = await this.supabase
      .from('session_branches')
      .update(updates)
      .eq('id', branchId);
    
    if (error) throw new Error(`Failed to update branch: ${error.message}`);
  }
  
  async getBranches(sessionId: string): Promise<SessionBranch[]> {
    const { data, error } = await this.supabase
      .from('session_branches')
      .select('*')
      .eq('session_id', sessionId)
      .order('branch_index', { ascending: true });
    
    if (error) throw new Error(`Failed to get branches: ${error.message}`);
    return data as SessionBranch[];
  }
  
  async completeSession(sessionId: string, efficiency: number): Promise<void> {
    const { error } = await this.supabase
      .from('distributed_sessions')
      .update({
        status: 'completed',
        parallel_efficiency: efficiency
      })
      .eq('id', sessionId);
    
    if (error) throw new Error(`Failed to complete session: ${error.message}`);
  }
}
