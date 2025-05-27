import { useState } from 'react';
import { generateFeedback } from '../services/claudeApi';

export const ApiDiagnostic = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    // Test 1: Environment Variables
    addResult('🔍 Checking environment variables...');
    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    addResult(`API Key present: ${!!apiKey}`);
    addResult(`API Key length: ${apiKey?.length || 0}`);
    addResult(`API Key format valid: ${apiKey?.startsWith('sk-ant-') || false}`);
    
    // Test 2: Network connectivity test
    addResult('🌐 Testing basic network connectivity...');
    try {
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        addResult('✅ Basic internet connectivity: OK');
      } else {
        addResult(`❌ Basic connectivity failed: ${response.status}`);
      }
    } catch (error: any) {
      addResult(`❌ Network test failed: ${error.message}`);
    }

    // Test 3: Anthropic API endpoint connectivity
    addResult('🔗 Testing Anthropic API endpoint connectivity...');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || 'test-key',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10
        })
      });
      
      if (response.status === 401) {
        addResult('✅ Anthropic API endpoint reachable (401 = auth issue, but endpoint accessible)');
      } else if (response.status === 400) {
        addResult('✅ Anthropic API endpoint reachable (400 = bad request, but endpoint accessible)');
      } else {
        addResult(`📊 Anthropic API response: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      if (error.message.includes('blocked') || error.message.includes('CORS')) {
        addResult('❌ Corporate firewall likely blocking Anthropic API');
      } else {
        addResult(`❌ Anthropic API test failed: ${error.message}`);
      }
    }

    // Test 4: Actual API call
    addResult('🤖 Testing actual Claude API call...');
    try {
      const feedback = await generateFeedback(
        'What is 2+2?',
        'Four',
        'The answer is 4, which is the sum of 2 and 2.'
      );
      
      if (feedback.includes('mock') || feedback.includes('Mock') || feedback.includes('API key')) {
        addResult('⚠️ API call returned mock response - API not working');
      } else {
        addResult('✅ Claude API call successful!');
      }
      addResult(`Response preview: ${feedback.substring(0, 100)}...`);
    } catch (error: any) {
      addResult(`❌ Claude API call failed: ${error.message}`);
    }

    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        🔧 API Diagnostic Tool
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This tool will help diagnose if the Practice Chat API is working correctly and identify any corporate network restrictions.
      </p>

      <button
        onClick={runDiagnostics}
        disabled={isRunning}
        className={`px-6 py-3 rounded-lg font-medium transition-all ${
          isRunning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isRunning ? '🔄 Running Diagnostics...' : '🚀 Run Diagnostics'}
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Diagnostic Results:
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`mb-2 font-mono text-sm ${
                  result.includes('✅') ? 'text-green-600 dark:text-green-400' :
                  result.includes('❌') ? 'text-red-600 dark:text-red-400' :
                  result.includes('⚠️') ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-gray-700 dark:text-gray-300'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && !isRunning && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Interpretation Guide:
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>Green (✅):</strong> Working correctly</li>
            <li>• <strong>Yellow (⚠️):</strong> Working but with limitations (mock responses)</li>
            <li>• <strong>Red (❌):</strong> Not working - likely corporate firewall blocking</li>
          </ul>
        </div>
      )}
    </div>
  );
};
