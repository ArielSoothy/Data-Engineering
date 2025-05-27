// Network connectivity test for corporate environments
console.log('🔍 Starting network connectivity tests...');

// Test 1: Basic connectivity
fetch('https://httpbin.org/get')
  .then(response => {
    console.log('✅ Basic internet connectivity: OK');
    console.log('Response status:', response.status);
  })
  .catch(error => {
    console.log('❌ Basic connectivity failed:', error.message);
  });

// Test 2: Anthropic API endpoint
fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'test-key',
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{ role: 'user', content: 'test' }],
    max_tokens: 10
  })
})
.then(response => {
  if (response.status === 401) {
    console.log('✅ Anthropic API endpoint reachable (401 = auth issue, but accessible)');
  } else {
    console.log('📊 Anthropic API response:', response.status, response.statusText);
  }
})
.catch(error => {
  if (error.message.includes('blocked') || error.message.includes('CORS')) {
    console.log('❌ Corporate firewall likely blocking Anthropic API');
  } else {
    console.log('❌ Anthropic API test failed:', error.message);
  }
});

// Test 3: Environment variables
const apiKey = import.meta?.env?.VITE_CLAUDE_API_KEY;
console.log('🔑 API Key configured:', !!apiKey);
console.log('🔑 API Key length:', apiKey?.length || 0);
console.log('🔑 API Key format valid:', apiKey?.startsWith('sk-ant-') || false);

console.log('🏁 Network tests completed. Check console for results.');
