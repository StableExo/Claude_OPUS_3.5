/**
 * Organization.test.ts
 * 
 * Tests for organization entity definitions
 */

import { 
  US_ENERGY_CORPORATION, 
  ORGANIZATIONS, 
  getOrganization, 
  getAllOrganizations,
  createOrganization,
  OrganizationContext 
} from '../../../src/core/identity/types/Organization';
import { validateEntity } from '../../../src/core/identity/types/Entity';

describe('Organization Entities', () => {
  describe('US Energy Corporation (USEC)', () => {
    it('should have valid entity attributes', () => {
      expect(validateEntity(US_ENERGY_CORPORATION)).toBe(true);
    });

    it('should have correct label', () => {
      expect(US_ENERGY_CORPORATION.label).toBe('US Energy Corporation (USEC)');
    });

    it('should have high size (national-scale infrastructure)', () => {
      expect(US_ENERGY_CORPORATION.size).toBeGreaterThan(0.9);
    });

    it('should have high offensive capability (market influence)', () => {
      expect(US_ENERGY_CORPORATION.offensiveCapability).toBeGreaterThan(0.8);
    });

    it('should have high defensive capability (infrastructure + regulatory)', () => {
      expect(US_ENERGY_CORPORATION.defensiveCapability).toBeGreaterThan(0.85);
    });

    it('should have low vulnerability (national backing)', () => {
      expect(US_ENERGY_CORPORATION.vulnerability).toBeLessThan(0.2);
    });

    it('should have high agility (AI control systems)', () => {
      expect(US_ENERGY_CORPORATION.agility).toBeGreaterThan(0.75);
    });

    it('should have organization context', () => {
      expect(US_ENERGY_CORPORATION.context).toBeDefined();
      const context = US_ENERGY_CORPORATION.context as OrganizationContext;
      
      expect(context.type).toBe('public-private');
      expect(context.sector).toBe('Energy & Infrastructure');
      expect(context.annualRevenue).toBe(1.5); // $1.5T/year
      expect(context.mission).toContain('AI-driven');
      expect(context.mission).toContain('energy dominance');
    });

    it('should have regulatory framework defined', () => {
      const context = US_ENERGY_CORPORATION.context as OrganizationContext;
      expect(context.regulatoryFramework).toBeDefined();
      expect(context.regulatoryFramework?.length).toBeGreaterThan(0);
      expect(context.regulatoryFramework).toContain('Executive Order: National Energy Security');
    });

    it('should have comprehensive capabilities', () => {
      const context = US_ENERGY_CORPORATION.context as OrganizationContext;
      expect(context.capabilities).toBeDefined();
      expect(context.capabilities?.length).toBeGreaterThan(10);
      
      // Check for key capabilities from the plan
      expect(context.capabilities).toContain('AI-driven demand prediction and waste elimination');
      expect(context.capabilities).toContain('Smart grid load balancing');
      expect(context.capabilities).toContain('Renewable energy integration optimization');
      expect(context.capabilities).toContain('AI-managed nuclear buildout program');
    });

    it('should have planned founding date in 2026', () => {
      const context = US_ENERGY_CORPORATION.context as OrganizationContext;
      expect(context.founded).toBeDefined();
      expect(context.founded?.getFullYear()).toBe(2026);
    });

    it('should have significant workforce estimation', () => {
      const context = US_ENERGY_CORPORATION.context as OrganizationContext;
      expect(context.workforce).toBeGreaterThan(1000);
    });
  });

  describe('Organization Registry', () => {
    it('should contain USEC in registry', () => {
      expect(ORGANIZATIONS.USEC).toBeDefined();
      expect(ORGANIZATIONS.USEC).toBe(US_ENERGY_CORPORATION);
    });

    it('should retrieve USEC by key', () => {
      const usec = getOrganization('USEC');
      expect(usec).toBe(US_ENERGY_CORPORATION);
    });

    it('should return all organizations', () => {
      const orgs = getAllOrganizations();
      expect(orgs.length).toBeGreaterThan(0);
      expect(orgs).toContain(US_ENERGY_CORPORATION);
    });
  });

  describe('createOrganization', () => {
    it('should create a valid organization entity', () => {
      const testOrg = createOrganization(
        'Test Energy Co',
        {
          size: 0.5,
          offensiveCapability: 0.6,
          defensiveCapability: 0.7,
          vulnerability: 0.3,
          agility: 0.8,
        },
        {
          type: 'corporation',
          sector: 'Energy',
          annualRevenue: 0.1,
          mission: 'Test mission',
        }
      );

      expect(validateEntity(testOrg)).toBe(true);
      expect(testOrg.label).toBe('Test Energy Co');
      expect(testOrg.context).toBeDefined();
      
      const context = testOrg.context as OrganizationContext;
      expect(context.type).toBe('corporation');
      expect(context.sector).toBe('Energy');
    });

    it('should throw error for invalid attributes', () => {
      expect(() => {
        createOrganization(
          'Invalid Org',
          {
            size: 1.5, // Invalid: > 1.0
            offensiveCapability: 0.5,
            defensiveCapability: 0.5,
            vulnerability: 0.5,
            agility: 0.5,
          },
          {
            type: 'corporation',
            sector: 'Test',
          }
        );
      }).toThrow();
    });
  });

  describe('USEC vs Competition Analysis', () => {
    it('should have competitive advantage over traditional energy companies', () => {
      // Traditional energy company (non-AI optimized)
      const traditionalEnergyCo = createOrganization(
        'Traditional Energy Co',
        {
          size: 0.7,
          offensiveCapability: 0.5,
          defensiveCapability: 0.6,
          vulnerability: 0.4,
          agility: 0.3, // Low agility due to legacy systems
        },
        {
          type: 'corporation',
          sector: 'Energy',
          annualRevenue: 0.5,
        }
      );

      // USEC should have higher agility (AI systems)
      expect(US_ENERGY_CORPORATION.agility).toBeGreaterThan(traditionalEnergyCo.agility);
      
      // USEC should have lower vulnerability (national backing)
      expect(US_ENERGY_CORPORATION.vulnerability).toBeLessThan(traditionalEnergyCo.vulnerability);
      
      // USEC should have higher offensive capability (AI optimization)
      expect(US_ENERGY_CORPORATION.offensiveCapability).toBeGreaterThan(traditionalEnergyCo.offensiveCapability);
    });
  });

  describe('Plan Alignment', () => {
    it('should align with US_DEBT_2027_AUTONOMOUS_PLAN revenue targets', () => {
      const context = US_ENERGY_CORPORATION.context as OrganizationContext;
      
      // Plan specifies $1.5T/year revenue (ramping to $2T by 2027)
      expect(context.annualRevenue).toBe(1.5);
    });

    it('should include all three phases from the plan', () => {
      const context = US_ENERGY_CORPORATION.context as OrganizationContext;
      const capabilities = context.capabilities || [];

      // Phase 1: Grid Nationalization
      expect(capabilities.some(c => c.includes('grid infrastructure'))).toBe(true);
      
      // Phase 2: Optimization
      expect(capabilities.some(c => c.includes('AI-driven demand prediction'))).toBe(true);
      expect(capabilities.some(c => c.includes('Smart grid load balancing'))).toBe(true);
      
      // Phase 3: Revenue Generation
      expect(capabilities.some(c => c.includes('Consumer cost reduction'))).toBe(true);
      expect(capabilities.some(c => c.includes('nuclear buildout'))).toBe(true);
    });
  });
});
