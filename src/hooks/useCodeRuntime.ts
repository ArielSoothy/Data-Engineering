import { useState, useRef, useCallback } from 'react';
import { loadPyodide } from 'pyodide';
import type { Database } from 'sql.js';
import initSqlJs from 'sql.js';

interface CodeRuntime {
  ready: boolean;
  loading: boolean;
  error: string | null;
  runSQL: (code: string) => Promise<string>;
  runPython: (code: string) => Promise<string>;
  initFor: (subject: 'sql' | 'python') => void;
}

export function useCodeRuntime(): CodeRuntime {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pyodideRef = useRef<any>(null);
  const sqlRef = useRef<Database | null>(null);
  const initingRef = useRef<string | null>(null);

  const initFor = useCallback((subject: 'sql' | 'python') => {
    if (subject === 'python' && pyodideRef.current) { setReady(true); return; }
    if (subject === 'sql' && sqlRef.current) { setReady(true); return; }
    if (initingRef.current === subject) return;

    initingRef.current = subject;
    setLoading(true);
    setError(null);
    setReady(false);

    (async () => {
      try {
        if (subject === 'python') {
          pyodideRef.current = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
          });
        } else {
          const SQL = await initSqlJs({
            locateFile: (file: string) =>
              file.endsWith('.wasm')
                ? 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/sql-wasm.wasm'
                : `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
          });
          sqlRef.current = new SQL.Database();
          const res = await fetch('./data/mock-db.sql');
          const sqlInit = await res.text();
          for (const stmt of sqlInit.split(';').filter(s => s.trim())) {
            sqlRef.current.run(stmt + ';');
          }
        }
        setReady(true);
      } catch (e) {
        console.error(`${subject} runtime init failed:`, e);
        setError(`Failed to load ${subject} runtime`);
      } finally {
        setLoading(false);
        initingRef.current = null;
      }
    })();
  }, []);

  const runSQL = useCallback(async (code: string): Promise<string> => {
    if (!sqlRef.current) return 'SQL runtime not initialized';
    try {
      const results = sqlRef.current.exec(code);
      if (results.length === 0) return 'Query executed successfully (no rows returned)';
      const cols = results[0].columns.join('\t');
      const rows = results[0].values.map((r: any[]) => r.join('\t')).join('\n');
      return `${cols}\n${'─'.repeat(cols.length)}\n${rows}\n\n(${results[0].values.length} row${results[0].values.length !== 1 ? 's' : ''})`;
    } catch (e: any) {
      return `SQL Error: ${e.message}`;
    }
  }, []);

  const runPython = useCallback(async (code: string): Promise<string> => {
    if (!pyodideRef.current) return 'Python runtime not initialized';
    try {
      let out = '';
      pyodideRef.current.setStdout({ batched: (s: string) => { out += s; } });
      const result = await pyodideRef.current.runPythonAsync(code);
      if (result !== undefined) out += (out ? '\n' : '') + result;
      return out || 'No output';
    } catch (e: any) {
      return `Python Error: ${e.message}`;
    }
  }, []);

  return { ready, loading, error, runSQL, runPython, initFor };
}
