// Simple test file to check if basic testing works
console.log('Testing basic functionality...');

const assert = require('assert');

// Simple test
assert.strictEqual(1 + 1, 2);
console.log('✅ Basic math test passed');

// Test environment
assert.strictEqual(typeof window, 'undefined');
console.log('✅ Node environment confirmed');

console.log('All basic tests passed!');
