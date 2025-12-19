/**
 * Organization.ts - Organization Entity Types
 *
 * Defines organizational entities that can be modeled using the Entity system.
 * Organizations can be analyzed using the same differential logic as any other entity.
 */

import { Entity, createEntity } from './Entity.js';

/**
 * Organization-specific context data
 */
export interface OrganizationContext extends Record<string, unknown> {
  /** Organization type */
  type: 'government' | 'corporation' | 'nonprofit' | 'cooperative' | 'public-private';
  
  /** Primary sector/industry */
  sector: string;
  
  /** Founding date (if applicable) */
  founded?: Date;
  
  /** Annual revenue target (in trillions USD) */
  annualRevenue?: number;
  
  /** Number of employees/participants */
  workforce?: number;
  
  /** Mission/purpose */
  mission?: string;
  
  /** Regulatory framework */
  regulatoryFramework?: string[];
  
  /** Key capabilities/services */
  capabilities?: string[];
}

/**
 * Create an organization entity with context
 */
export function createOrganization(
  label: string,
  attributes: Omit<Entity, 'label' | 'context'>,
  orgContext: OrganizationContext
): Entity {
  return createEntity(label, {
    ...attributes,
    context: orgContext,
  });
}

/**
 * US Energy Corporation (USEC)
 * 
 * As defined in US_DEBT_2027_AUTONOMOUS_PLAN.md:
 * - National energy grid operator
 * - AI-optimized energy management
 * - Revenue target: $1.5T/year (ramping to $2T by 2027)
 * - Mission: National energy dominance through AI optimization
 */
export const US_ENERGY_CORPORATION: Entity = createOrganization(
  'US Energy Corporation (USEC)',
  {
    // Size: Large national-scale infrastructure operator
    size: 0.95,
    
    // Offensive capability: High market influence and competitive advantage
    offensiveCapability: 0.85,
    
    // Defensive capability: Strong infrastructure and regulatory protection
    defensiveCapability: 0.90,
    
    // Vulnerability: Low due to national backing and critical infrastructure status
    vulnerability: 0.15,
    
    // Agility: High due to AI control systems and modern infrastructure
    agility: 0.80,
  },
  {
    type: 'public-private',
    sector: 'Energy & Infrastructure',
    founded: new Date('2026-01-01'), // Planned founding as per document
    annualRevenue: 1.5, // $1.5T/year target
    mission: 'National energy dominance through AI-driven grid optimization and efficiency',
    regulatoryFramework: [
      'Executive Order: National Energy Security',
      'Federal Energy Regulatory Commission (FERC) oversight',
      'Department of Energy coordination',
      'AI Ethics and Transparency Standards',
    ],
    capabilities: [
      // Phase 1: Grid Nationalization (Month 1-6)
      'National energy grid infrastructure ownership and operation',
      'Fair market buyout of existing grid infrastructure',
      'AI control systems deployment',
      
      // Phase 2: Optimization (Month 7-12)
      'AI-driven demand prediction and waste elimination',
      'Smart grid load balancing',
      'Renewable energy integration optimization',
      'Energy storage arbitrage',
      'Peak/off-peak optimization',
      
      // Phase 3: Revenue Generation (Month 13-24)
      'Consumer cost reduction (30% target)',
      'Transmission loss elimination (6% current waste)',
      'Generation mix optimization',
      'Energy export to Canada/Mexico',
      'AI-managed nuclear buildout program',
      
      // Core competencies
      'Real-time grid monitoring and control',
      'Predictive maintenance',
      'Cybersecurity and grid protection',
      'Renewable energy integration',
      'Energy storage management',
      'Market operations and trading',
    ],
    workforce: 50000, // Estimated workforce for national grid operation
  }
);

/**
 * Export organization entities registry
 */
export const ORGANIZATIONS = {
  USEC: US_ENERGY_CORPORATION,
} as const;

/**
 * Type for organization keys
 */
export type OrganizationKey = keyof typeof ORGANIZATIONS;

/**
 * Get an organization entity by key
 */
export function getOrganization(key: OrganizationKey): Entity {
  return ORGANIZATIONS[key];
}

/**
 * Get all registered organizations
 */
export function getAllOrganizations(): Entity[] {
  return Object.values(ORGANIZATIONS);
}
