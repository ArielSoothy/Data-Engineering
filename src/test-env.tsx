import React from 'react';

export function TestEnv() {
  return (
    <div>
      <h1>Environment Variable Test</h1>
      <pre>
        VITE_CLAUDE_API_KEY exists: {!!import.meta.env.VITE_CLAUDE_API_KEY ? 'Yes' : 'No'}
        <br />
        VITE_CLAUDE_API_KEY length: {import.meta.env.VITE_CLAUDE_API_KEY?.length || 0}
        <br />
        VITE_CLAUDE_API_KEY type: {typeof import.meta.env.VITE_CLAUDE_API_KEY}
        <br />
        First 5 chars: {import.meta.env.VITE_CLAUDE_API_KEY?.substring(0, 5) || 'none'}
        <br />
        Last 5 chars: {import.meta.env.VITE_CLAUDE_API_KEY?.slice(-5) || 'none'}
      </pre>
    </div>
  );
}
