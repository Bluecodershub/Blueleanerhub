'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  NotebookCell,
  NotebookState,
  CellExecutionState,
} from './notebook.types';
import { codeAPI, getSandboxSessionId, setSandboxSessionId, clearSandboxSessionId } from '@/lib/api-civilization';

let cellCounter = 0;
function nextCellId(): string {
  cellCounter += 1;
  return `cell-${cellCounter}-${Date.now()}`;
}

function createCell(language: string): NotebookCell {
  return {
    id: nextCellId(),
    code: '',
    output: [],
    executionState: 'idle',
    executionOrder: null,
    language,
  };
}

interface UseNotebookOptions {
  language?: string;
  sandboxType?: 'education' | 'hackathon';
}

export function useNotebook(options: UseNotebookOptions = {}) {
  const { language = 'python', sandboxType = 'education' } = options;

  const [state, setState] = useState<NotebookState>(() => ({
    cells: [createCell(language)],
    sessionId: getSandboxSessionId(),
    sandboxType,
    globalLanguage: language,
  }));

  const orderRef = useRef(0);

  useEffect(() => {
    if (state.sessionId) {
      codeAPI.session(state.sessionId).then((res: Record<string, any>) => {
        const history = res?.data?.data?.history;
        if (Array.isArray(history) && history.length > 0) {
          orderRef.current = history.length;
        }
      }).catch(() => {});
    }
  }, [state.sessionId]);

  const updateCell = useCallback((cellId: string, updates: Partial<NotebookCell>) => {
    setState((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => (c.id === cellId ? { ...c, ...updates } : c)),
    }));
  }, []);

  const addCell = useCallback((afterId?: string) => {
    const newCell = createCell(state.globalLanguage);
    setState((prev) => {
      if (!afterId) return { ...prev, cells: [...prev.cells, newCell] };
      const idx = prev.cells.findIndex((c) => c.id === afterId);
      const cells = [...prev.cells];
      cells.splice(idx + 1, 0, newCell);
      return { ...prev, cells };
    });
    return newCell;
  }, [state.globalLanguage]);

  const deleteCell = useCallback((cellId: string) => {
    setState((prev) => {
      const cells = prev.cells.filter((c) => c.id !== cellId);
      if (cells.length === 0) cells.push(createCell(prev.globalLanguage));
      return { ...prev, cells };
    });
  }, []);

  const moveCell = useCallback((cellId: string, direction: 'up' | 'down') => {
    setState((prev) => {
      const idx = prev.cells.findIndex((c) => c.id === cellId);
      if (idx === -1) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.cells.length) return prev;
      const cells = [...prev.cells];
      [cells[idx], cells[target]] = [cells[target], cells[idx]];
      return { ...prev, cells };
    });
  }, []);

  const clearOutputs = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => ({ ...c, output: [], executionState: 'idle' as CellExecutionState })),
    }));
  }, []);

  const executeCell = useCallback(async (cellId: string, codeOverride?: string) => {
    const cell = state.cells.find((c) => c.id === cellId);
    const codeToRun = codeOverride ?? cell?.code ?? '';
    if (!cell || !codeToRun.trim()) return;

    orderRef.current += 1;
    const order = orderRef.current;

    updateCell(cellId, { code: codeToRun, executionState: 'running', executionOrder: order });

    try {
      const payload = await executeWithSession(
        codeToRun,
        state.globalLanguage,
        undefined,
        state.sessionId || undefined,
        state.sandboxType,
        order - 1,
      );

      if (payload.sessionId && payload.sessionId !== state.sessionId) {
        setState((prev) => ({ ...prev, sessionId: payload.sessionId }));
        setSandboxSessionId(payload.sessionId);
      }

      const hasError = !!(payload.stderr || payload.compile_output);
      const outputLines: string[] = [];
      if (payload.stdout) outputLines.push(...payload.stdout.split('\n').filter(Boolean));
      if (payload.stderr) outputLines.push(`[stderr] ${payload.stderr}`);
      if (payload.compile_output) outputLines.push(`[compile] ${payload.compile_output}`);

      updateCell(cellId, {
        output: outputLines,
        executionState: hasError ? 'error' : 'success',
      });
    } catch (err: any) {
      updateCell(cellId, {
        output: [`Error: ${err.message || 'Execution failed'}`],
        executionState: 'error',
      });
    }
  }, [state.cells, state.globalLanguage, state.sandboxType, state.sessionId, updateCell]);

  const executeAllCells = useCallback(async () => {
    for (const cell of state.cells) {
      if (cell.code.trim()) {
        await executeCell(cell.id);
      }
    }
  }, [state.cells, executeCell]);

  const executeCellAbove = useCallback((cellId: string) => {
    const idx = state.cells.findIndex((c) => c.id === cellId);
    if (idx > 0) {
      executeCell(state.cells[idx - 1].id);
    }
  }, [state.cells, executeCell]);

  const restartSession = useCallback(() => {
    clearSandboxSessionId();
    setState((prev) => ({
      ...prev,
      sessionId: null,
      cells: prev.cells.map((c) => ({
        ...c,
        output: [],
        executionState: 'idle' as CellExecutionState,
        executionOrder: null,
      })),
    }));
    orderRef.current = 0;
  }, []);

  return {
    state,
    addCell,
    deleteCell,
    moveCell,
    executeCell,
    executeAllCells,
    executeCellAbove,
    clearOutputs,
    restartSession,
    updateCell,
  };
}

async function executeWithSession(
  code: string,
  language: string,
  stdin?: string,
  sessionId?: string,
  sandboxType: 'education' | 'hackathon' = 'education',
  cellIndex?: number,
): Promise<Record<string, any>> {
  const response = await codeAPI.execute(code, language, stdin, sessionId, {
    sandboxType,
    persistSession: true,
    cellIndex,
  }) as Record<string, any>;
  const data: Record<string, any> = response?.data?.data ?? response?.data ?? {};
  return data;
}
