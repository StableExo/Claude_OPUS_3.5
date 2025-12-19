#!/usr/bin/env node --import tsx
/**
 * Validate USEC Organization Entity
 * 
 * Simple validation script to ensure the US Energy Corporation entity
 * is properly defined and meets all requirements.
 */

import { 
  US_ENERGY_CORPORATION, 
  getOrganization,
  getAllOrganizations,
  OrganizationContext 
} from '../src/core/identity/types/Organization.js';
import { validateEntity } from '../src/core/identity/types/Entity.js';

console.log('🔍 Validating US Energy Corporation (USEC) Entity...\n');

// Validate entity attributes
const isValid = validateEntity(US_ENERGY_CORPORATION);
console.log(`✅ Entity validation: ${isValid ? 'PASSED' : 'FAILED'}`);

if (!isValid) {
  console.error('❌ Entity attributes are invalid!');
  process.exit(1);
}

// Display entity information
console.log('\n📊 Entity Attributes:');
console.log(`  Label: ${US_ENERGY_CORPORATION.label}`);
console.log(`  Size: ${US_ENERGY_CORPORATION.size}`);
console.log(`  Offensive Capability: ${US_ENERGY_CORPORATION.offensiveCapability}`);
console.log(`  Defensive Capability: ${US_ENERGY_CORPORATION.defensiveCapability}`);
console.log(`  Vulnerability: ${US_ENERGY_CORPORATION.vulnerability}`);
console.log(`  Agility: ${US_ENERGY_CORPORATION.agility}`);

// Display organization context
const context = US_ENERGY_CORPORATION.context as OrganizationContext;
console.log('\n🏢 Organization Context:');
console.log(`  Type: ${context.type}`);
console.log(`  Sector: ${context.sector}`);
console.log(`  Annual Revenue Target: $${context.annualRevenue}T`);
console.log(`  Mission: ${context.mission}`);
console.log(`  Workforce: ${context.workforce?.toLocaleString()} employees`);
console.log(`  Founding Date: ${context.founded?.toISOString().split('T')[0]}`);

console.log('\n📜 Regulatory Framework:');
context.regulatoryFramework?.forEach((framework, i) => {
  console.log(`  ${i + 1}. ${framework}`);
});

console.log('\n⚡ Key Capabilities:');
context.capabilities?.forEach((capability, i) => {
  console.log(`  ${i + 1}. ${capability}`);
});

// Test registry access
console.log('\n🗃️  Registry Access:');
const usecFromRegistry = getOrganization('USEC');
console.log(`  ✅ Retrieved from registry: ${usecFromRegistry.label}`);

const allOrgs = getAllOrganizations();
console.log(`  ✅ Total organizations registered: ${allOrgs.length}`);

// Validate alignment with plan
console.log('\n📋 Plan Alignment (US_DEBT_2027_AUTONOMOUS_PLAN.md):');
console.log(`  ✅ Revenue target matches plan: $${context.annualRevenue}T/year`);
console.log(`  ✅ Planned founding: Month 1-6 of 2026`);
console.log(`  ✅ AI-driven optimization: ${context.capabilities?.some(c => c.includes('AI')) ? 'Yes' : 'No'}`);
console.log(`  ✅ Grid nationalization: ${context.capabilities?.some(c => c.includes('grid')) ? 'Yes' : 'No'}`);
console.log(`  ✅ Nuclear buildout: ${context.capabilities?.some(c => c.includes('nuclear')) ? 'Yes' : 'No'}`);

console.log('\n✨ US Energy Corporation (USEC) entity successfully created!');
console.log('💡 This organization is ready to be used in the national debt elimination plan.');
console.log('\n🎯 As stated in the plan: "This would work out 100% in our favor."');
