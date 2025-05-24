// Test script for environment variables
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env file
config();

console.log('Environment Variables Test:');
console.log('---------------------------');
console.log('VITE_CLAUDE_API_KEY exists:', !!process.env.VITE_CLAUDE_API_KEY);
console.log('VITE_CLAUDE_API_KEY length:', process.env.VITE_CLAUDE_API_KEY?.length);
if (process.env.VITE_CLAUDE_API_KEY) {
  console.log('First 8 chars:', process.env.VITE_CLAUDE_API_KEY.substring(0, 8));
  console.log('Last 5 chars:', process.env.VITE_CLAUDE_API_KEY.slice(-5));
}

// Check .env file content
try {
  const envPath = path.resolve('.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n.env file content:');
  console.log('---------------------------');
  console.log(envContent);
  console.log('---------------------------');
  console.log('Contains newlines:', envContent.includes('\n'));
  console.log('Contains carriage returns:', envContent.includes('\r'));
  console.log('Contains // comments:', envContent.includes('//'));
  console.log('Contains quotes around value:', /VITE_CLAUDE_API_KEY=".*?"/.test(envContent) || /VITE_CLAUDE_API_KEY='.*?'/.test(envContent));
} catch (error) {
  console.error('Error reading .env file:', error);
}
