import { useState } from 'react';
import { Send } from 'lucide-react';
import { generateFeedback } from '../services/claudeApi';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PracticeChatProps {
  question: string;
  answer: string;
}

export const PracticeChat = ({ question, answer }: PracticeChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: `**Question:**\n${question}\n\nType your answer to this question, and I'll provide feedback based on the model solution. Try to be comprehensive and include all key points in your answer.`
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Debug logging
    console.log('=== API Debug Info ===');
    const rawKey = import.meta.env.VITE_CLAUDE_API_KEY;
    const cleanedKey = typeof rawKey === 'string' 
      ? rawKey.replace(/^["'](.*)["']$/, '$1').trim() 
      : rawKey;
      
    console.log('Environment check:', {
      hasKey: !!rawKey,
      keyLength: rawKey?.length,
      cleanedKeyLength: cleanedKey?.length,
      firstChars: rawKey?.substring(0, 10),
      lastChars: rawKey?.slice(-5),
      keyType: typeof rawKey,
      containsQuotes: typeof rawKey === 'string' && (rawKey.startsWith('"') || rawKey.startsWith("'"))
    });
    
    if (typeof rawKey === 'string' && rawKey !== cleanedKey) {
      console.log('⚠️ API key contains quotes or extra whitespace that may need to be removed');
    }
    
    // Try to load API key from localStorage as a fallback 
    // (will be there if user successfully tested on the test page)
    const localStorageKey = localStorage.getItem('claude_api_key');
    if (localStorageKey && (!rawKey || rawKey === 'undefined')) {
      console.log('Using API key from localStorage instead of environment variables');
    }
    
    console.log('===================');

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const feedback = await generateFeedback(question, input, answer);
      setMessages(prev => [...prev, { role: 'assistant', content: feedback }]);
    } catch (error: any) {
      console.error('Failed to get feedback:', error);
      
      // Provide a more helpful error message to the user
      const errorMessage = error.message || 'Unknown error';
      const isApiKeyError = errorMessage.includes('401') || 
                           errorMessage.includes('403') || 
                           errorMessage.includes('auth') || 
                           errorMessage.includes('key');
      
      let userErrorMessage = 'Sorry, I encountered an error generating feedback. Please try again.';
      
      if (isApiKeyError) {
        userErrorMessage = 'There seems to be an issue with the API key. Please check that your Claude API key is valid and correctly configured in the .env file.';
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        userErrorMessage = 'Network error encountered. Please check your internet connection and try again.';
      }
      
      // Add the actual error message for debugging
      userErrorMessage += `\n\nDebug info: ${errorMessage}`;
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: userErrorMessage }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-800 p-3 rounded-lg">
              <div className="animate-pulse">Generating feedback...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer here. Be comprehensive and detailed to get the best feedback..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isLoading}
            rows={6}
            style={{ resize: 'vertical' }}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 transition-all duration-200 flex items-center ${
                isLoading || !input.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send size={18} className="mr-2" />
              {isLoading ? 'Generating feedback...' : 'Get AI Feedback'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};