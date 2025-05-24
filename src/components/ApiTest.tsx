import { useState } from 'react';
import { generateFeedback } from '../services/claudeApi';

export const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleTestApi = async () => {
    setLoading(true);
    setError('');
    try {
      const feedback = await generateFeedback(
        "What is a primary key in SQL?",
        "A primary key is a column that uniquely identifies each row.", 
        "A primary key is a column or group of columns in a table that uniquely identifies each row. It enforces entity integrity by ensuring no duplicate or null values. Primary keys often serve as the basis for relationships with other tables."
      );
      setResult(feedback);
    } catch (err: any) {
      console.error('API Test error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Claude API Test</h2>
      
      <button
        onClick={handleTestApi}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition-all duration-200"
      >
        {loading ? 'Testing...' : 'Test API Call'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h3 className="font-bold">API Response:</h3>
          <pre className="mt-2 p-3 bg-gray-100 rounded-md whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};
