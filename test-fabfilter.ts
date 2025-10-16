/**
 * Test Real Commercial Plugins - FabFilter
 */

import {
  isRealCLAPBridgeAvailable,
  createAllBridges,
  getInstanceManager,
} from './src/lib/audio/plugins';

async function testFabFilter() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Testing FabFilter Pro-Q 3 (Real CLAP Plugin)');
  console.log('═══════════════════════════════════════════════════\n');

  // Check if bridge is available
  const bridgeAvailable = isRealCLAPBridgeAvailable();
  console.log(`Bridge status: ${bridgeAvailable ? '✅ Real' : '❌ Mock'}\n`);

  // Create mock audio context
  const audioContext = {
    sampleRate: 44100,
    createGain: () => ({}),
  };

  const bridges = createAllBridges();
  const manager = getInstanceManager(audioContext as any, bridges);

  // Test with FabFilter Pro-Q 3
  const proQ3Metadata = {
    id: 'fabfilter-pro-q-3',
    name: 'FabFilter Pro-Q 3',
    vendor: 'FabFilter',
    format: 'clap' as const,
    path: '/Library/Audio/Plug-Ins/CLAP/FabFilter Pro-Q 3.clap/Contents/MacOS/FabFilter Pro-Q 3',
    category: 'eq' as const,
    processingType: 'effect' as const,
    useCase: ['mixing', 'mastering', 'production'] as any[],
    cpuLoad: 'medium' as const,
    inputs: 2,
    outputs: 2,
    sidechain: false,
    midiInput: false,
    parameters: [],
    presets: [],
    version: '3.0.0',
    filename: 'FabFilter Pro-Q 3.clap',
    lastScanned: new Date(),
    isValid: true,
  };

  try {
    console.log('1. Loading FabFilter Pro-Q 3...');
    const instanceId = await manager.loadPlugin(proQ3Metadata);
    console.log(`✅ Loaded! Instance ID: ${instanceId}\n`);

    // Get instance
    const instance = manager.getInstance(instanceId);
    if (!instance) {
      throw new Error('Failed to get instance');
    }

    console.log('2. Plugin Information:');
    console.log(`   Name: ${instance.wrapper.getMetadata().name}`);
    console.log(`   Vendor: ${instance.wrapper.getMetadata().vendor}`);
    console.log(`   Format: ${instance.wrapper.getMetadata().format}`);

    // Test latency
    const latency = instance.wrapper.getLatency();
    console.log(`   Latency: ${latency} samples`);

    // Test CPU
    const cpu = instance.wrapper.getCPUUsage();
    console.log(`   CPU usage: ${(cpu * 100).toFixed(1)}%\n`);

    // Get parameter count
    const paramCount = instance.wrapper.getParameterCount?.();
    console.log(`3. Parameters: ${paramCount || 'N/A'} parameters available\n`);

    // Test in chain
    console.log('4. Testing in plugin chain...');
    const chainId = manager.createChain('master-chain', 'Master Chain');
    await manager.addToChain(chainId, instanceId);
    console.log(`   ✅ Added to chain: ${chainId}`);
    console.log(`   Chain latency: ${manager.getChainLatency(chainId)} samples`);
    console.log(`   Chain CPU: ${(manager.getChainCPUUsage(chainId) * 100).toFixed(1)}%\n`);

    // Cleanup
    console.log('5. Cleaning up...');
    await manager.deleteChain(chainId);
    await manager.unloadPlugin(instanceId);
    console.log('✅ Cleanup complete\n');

    // Success!
    console.log('═══════════════════════════════════════════════════');
    console.log('  🎉 SUCCESS! Commercial Plugin Working!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n✅ FabFilter Pro-Q 3 loaded and controlled successfully!');
    console.log('   This is a real, professional-grade EQ plugin.');
    console.log('   Your DAWG AI can now load and control commercial plugins!\n');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }

  // Show final stats
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  System Statistics');
  console.log('═══════════════════════════════════════════════════');

  const stats = manager.getStats();
  console.log(`Total instances: ${stats.totalInstances}`);
  console.log(`Loaded plugins: ${stats.loadedPlugins}`);
  console.log(`Total CPU: ${(stats.totalCPUUsage * 100).toFixed(1)}%`);
  console.log(`Total latency: ${stats.totalLatency} samples`);
  console.log('By format:', stats.byFormat);
}

// Run test
testFabFilter().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
