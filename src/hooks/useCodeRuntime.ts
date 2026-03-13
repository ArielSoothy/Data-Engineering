import { useState, useRef, useCallback } from 'react';
import { loadPyodide } from 'pyodide';
import type { Database } from 'sql.js';
import initSqlJs from 'sql.js';

export interface SQLResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  error?: string;
}

interface CodeRuntime {
  ready: boolean;
  loading: boolean;
  error: string | null;
  runSQL: (code: string) => Promise<SQLResult>;
  runPython: (code: string) => Promise<string>;
  getSchema: () => Promise<SQLResult>;
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

  const runSQL = useCallback(async (code: string): Promise<SQLResult> => {
    if (!sqlRef.current) return { columns: [], rows: [], rowCount: 0, error: 'SQL runtime not initialized' };
    try {
      const results = sqlRef.current.exec(code);
      if (results.length === 0) return { columns: [], rows: [], rowCount: 0 };
      return {
        columns: results[0].columns,
        rows: results[0].values,
        rowCount: results[0].values.length,
      };
    } catch (e: any) {
      return { columns: [], rows: [], rowCount: 0, error: e.message };
    }
  }, []);

  const getSchema = useCallback(async (): Promise<SQLResult> => {
    if (!sqlRef.current) return { columns: [], rows: [], rowCount: 0, error: 'SQL runtime not initialized' };
    return runSQL("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name");
  }, [runSQL]);

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

  return { ready, loading, error, runSQL, runPython, getSchema, initFor };
}
