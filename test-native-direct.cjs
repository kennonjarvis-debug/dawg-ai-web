// Direct test of native module loading
const path = require('path');

const bridgePath = path.join(__dirname, 'native-bridges', 'clap', 'index.node');
console.log('Trying to load from:', bridgePath);
console.log('File exists:', require('fs').existsSync(bridgePath));

try {
  const bridge = require(bridgePath);
  console.log('✅ Native bridge loaded successfully!');
  console.log('Available functions:', Object.keys(bridge));
} catch (error) {
  console.error('❌ Failed to load:', error.message);
  console.error('Full error:', error);
}
