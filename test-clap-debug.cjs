// Debug CLAP plugin loading
const path = require('path');

const bridgePath = path.join(__dirname, 'native-bridges', 'clap', 'index.node');
const bridge = require(bridgePath);

console.log('Testing FabFilter Pro-Q 3 CLAP loading...\n');

const pluginPath = '/Library/Audio/Plug-Ins/CLAP/FabFilter Pro-Q 3.clap/Contents/MacOS/FabFilter Pro-Q 3';

try {
  console.log('1. Loading plugin:', pluginPath);
  const handle = bridge.loadPlugin(pluginPath, 0);
  console.log('✅ Plugin loaded! Handle:', handle);

  console.log('\n2. Getting descriptor...');
  const descriptor = bridge.getDescriptor(handle);
  console.log('Descriptor:', JSON.stringify(descriptor, null, 2));

  console.log('\n3. Initializing plugin...');
  const initSuccess = bridge.initialize(handle);
  console.log('Initialize result:', initSuccess);

  if (initSuccess) {
    console.log('\n4. Activating plugin...');
    const activateSuccess = bridge.activate(handle, 44100, 128, 8192);
    console.log('Activate result:', activateSuccess);

    if (activateSuccess) {
      console.log('\n5. Getting parameter count...');
      const paramCount = bridge.getParameterCount(handle);
      console.log('Parameter count:', paramCount);

      console.log('\n6. Getting latency...');
      const latency = bridge.getLatency(handle);
      console.log('Latency:', latency, 'samples');

      console.log('\n✅ SUCCESS! Commercial plugin loaded and activated!');
    }

    console.log('\n7. Cleaning up...');
    bridge.deactivate(handle);
  }

  bridge.unloadPlugin(handle);
  console.log('✅ Plugin unloaded');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('\nStack:', error.stack);
}
