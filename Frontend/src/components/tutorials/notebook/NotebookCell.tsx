import React, { useState, useCallback, useEffect } from 'react';
import { NotebookCell as NotebookCellType, CellExecutionState } from './notebook.types';

interface NotebookCellProps {
  cell: NotebookCellType;
  index: number;
  onExecute: (code: string) => Promise<void>;
  onUpdate: (code: string) => void;
  readOnly?: boolean;
  collapsed?: boolean;
  onToggleOutput?: () => void;
  onDelete?: () => void;
}

export const NotebookCell: React.FC<NotebookCellProps> = ({
  cell,
  index,
  onExecute,
  onUpdate,
  readOnly = false,
  collapsed = false,
  onToggleOutput,
  onDelete,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [code, setCode] = useState(cell.code);

  useEffect(() => {
    setCode(cell.code);
  }, [cell.code]);

  const handleExecute = useCallback(async () => {
    setIsExecuting(true);
    try {
      await onExecute(code);
    } finally {
      setIsExecuting(false);
    }
  }, [code, onExecute]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onUpdate(newCode);
  }, [onUpdate]);

  const stateColor = (state: CellExecutionState): string => {
    switch (state) {
      case 'running': return 'border-yellow-400';
      case 'success': return 'border-green-400';
      case 'error': return 'border-red-400';
      default: return 'border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className={`border-2 rounded-lg overflow-hidden mb-2 transition-colors ${stateColor(cell.executionState)}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium">[{index + 1}]</span>
          <span className="text-[10px] uppercase tracking-wider">{cell.language}</span>
          {cell.executionOrder && (
            <span className="text-[10px] text-muted-foreground/60">
              Exec #{cell.executionOrder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!readOnly && (
            <button
              onClick={handleExecute}
              disabled={isExecuting || !code.trim()}
              className="px-2 py-0.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-medium transition-colors"
            >
              {isExecuting ? (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-spin rounded-full border border-current border-t-transparent" />
                  Run
                </span>
              ) : (
                'Run'
              )}
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
              title="Delete cell"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Code editor */}
      <textarea
        value={code}
        onChange={handleChange}
        readOnly={readOnly}
        className="w-full p-3 font-mono text-sm resize-y min-h-[60px] focus:outline-none bg-background text-foreground placeholder:text-muted-foreground/50"
        spellCheck={false}
        placeholder="Enter code here..."
      />

      {/* Output display */}
      {cell.output.length > 0 && (
        <div className="border-t border-border">
          <button
            onClick={onToggleOutput}
            className="flex w-full items-center justify-between bg-muted/30 px-3 py-1 text-[10px] text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <span>Output ({cell.output.length} lines)</span>
            <svg
              className={`h-3 w-3 transition-transform ${collapsed ? '' : 'rotate-180'}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {!collapsed && (
            <div className="bg-gray-900 text-green-400 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-0.5">
              {cell.output.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap leading-5">{line}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Executing indicator */}
      {isExecuting && (
        <div className="border-t border-border bg-yellow-50 dark:bg-yellow-900/10 px-3 py-1">
          <span className="text-[10px] text-yellow-600 dark:text-yellow-400">Executing...</span>
        </div>
      )}
    </div>
  );
};

export default NotebookCell;
