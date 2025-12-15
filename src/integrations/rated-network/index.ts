/**
 * Rated Network Integration
 * 
 * Complete integration with the Rated Network API for validator,
 * operator, and builder performance metrics.
 * 
 * @example
 * ```typescript
 * import { createRatedNetworkClient, createBuilderDataAdapter } from './integrations/rated-network';
 * 
 * // Create client
 * const client = createRatedNetworkClient(process.env.RATED_NETWORK_API_KEY!);
 * 
 * // Get operator effectiveness
 * const effectiveness = await client.getOperatorEffectiveness('flashbots');
 * 
 * // Create adapter for builder data
 * const adapter = createBuilderDataAdapter(client);
 * const builderMetadata = await adapter.getBuilderMetadata('flashbots');
 * ```
 */

export * from './types.js';
export * from './RatedNetworkClient.js';
export * from './BuilderDataAdapter.js';

// Re-export commonly used functions
export { createRatedNetworkClient } from './RatedNetworkClient.js';
export { createBuilderDataAdapter } from './BuilderDataAdapter.js';
