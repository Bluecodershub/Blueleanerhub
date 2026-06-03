'use client';

import React, { useState } from 'react';
import { useNotebook } from './useNotebook';
import { NotebookCell } from './NotebookCell';
import { Plus, Play, RotateCcw, Trash2 } from 'lucide-react';

interface NotebookEditorProps {
  initialLanguage?: string;
  readOnly?: boolean;
}

export const NotebookEditor: React.FC<NotebookEditorProps> = ({
  initialLanguage = 'python',
  readOnly = false,
}) => {
  const {
    state,
    addCell,
    deleteCell,
    moveCell,
    executeCell,
    executeAllCells,
    clearOutputs,
    restartSession,
    updateCell,
  } = useNotebook({ language: initialLanguage });

  const [collapsedOutputs, setCollapsedOutputs] = useState<Set<string>>(new Set());

  const toggleOutput = (cellId: string) => {
    setCollapsedOutputs((prev) => {
      const next = new Set(prev);
      if (next.has(cellId)) next.delete(cellId);
      else next.add(cellId);
      return next;
    });
  };

  return (
    <div className="notebook-editor space-y-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => addCell()}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Add cell"
          >
            <Plus className="h-3.5 w-3.5" />
            Cell
          </button>
          <button
            onClick={executeAllCells}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            title="Run all cells"
          >
            <Play className="h-3.5 w-3.5" />
            Run All
          </button>
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-2 text-[10px] text-muted-foreground">
            {state.sessionId ? `Session: ${state.sessionId.slice(0, 8)}...` : 'No session'}
          </span>
          <button
            onClick={clearOutputs}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Clear outputs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={restartSession}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Restart session (clear context)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Cells */}
      <div className="space-y-1">
        {state.cells.map((cell, index) => (
          <div key={cell.id} className="group relative">
            {/* Cell controls (shown on hover) */}
            {!readOnly && (
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={() => addCell(cell.id)}
                  className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-muted-foreground hover:text-foreground text-[10px]"
                  title="Insert cell below"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => moveCell(cell.id, 'up')}
                  disabled={index === 0}
                  className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 text-[10px]"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveCell(cell.id, 'down')}
                  disabled={index === state.cells.length - 1}
                  className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 text-[10px]"
                  title="Move down"
                >
                  ↓
                </button>
              </div>
            )}

            <NotebookCell
              cell={cell}
              index={index}
              onExecute={(code) => {
                updateCell(cell.id, { code });
                return executeCell(cell.id, code);
              }}
              onUpdate={(code) => updateCell(cell.id, { code })}
              readOnly={readOnly}
              collapsed={collapsedOutputs.has(cell.id)}
              onToggleOutput={() => toggleOutput(cell.id)}
              onDelete={!readOnly && state.cells.length > 1 ? () => deleteCell(cell.id) : undefined}
            />
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5">
        <span className="text-[10px] text-muted-foreground">
          {state.cells.length} cell{state.cells.length !== 1 ? 's' : ''}
          {' · '}
          {state.cells.filter((c) => c.executionState === 'success').length} passed
          {' · '}
          {state.cells.filter((c) => c.executionState === 'error').length} errors
        </span>
        <span className="text-[10px] text-muted-foreground">
          Language: {state.globalLanguage}
        </span>
      </div>
    </div>
  );
};

export default NotebookEditor;
