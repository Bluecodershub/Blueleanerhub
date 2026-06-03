export type CellExecutionState = 'idle' | 'running' | 'success' | 'error';  
  
export interface NotebookCell {  
  id: string;  
  code: string;  
  output: string[];  
  executionState: CellExecutionState;  
  executionOrder: number | null;  
  language: string;  
}  
  
export interface NotebookState {  
  cells: NotebookCell[];  
  sessionId: string | null;  
  sandboxType: 'education' | 'hackathon';  
  globalLanguage: string;  
}  
  
export interface CellExecutionResponse {  
  stdout?: string;  
  stderr?: string;  
  compile_output?: string;  
  sessionId?: string;  
} 
