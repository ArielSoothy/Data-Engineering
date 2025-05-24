import React from 'react';
import ReactDOM from 'react-dom/client';

function EnvTest() {
  return (
    <div>
      <h1>Env Test</h1>
      <div>
        {Object.keys(import.meta.env).map(key => (
          <div key={key}>
            {key}: {typeof import.meta.env[key] === 'string' 
              ? (key.includes('KEY') || key.includes('SECRET') 
                ? `${import.meta.env[key].substring(0, 5)}...${import.meta.env[key].slice(-5)}` 
                : import.meta.env[key])
              : typeof import.meta.env[key]}
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EnvTest />
  </React.StrictMode>
);
