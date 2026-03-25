export type VisualizationTemplate =
  | 'array-to-dict'
  | 'array-to-set'
  | 'array-grouping'
  | 'table-join'
  | 'table-groupby'
  | 'table-casewhen'
  | 'table-window';

export interface StepHighlight {
  elementId: string;
  action: 'add' | 'remove' | 'highlight' | 'move' | 'compare' | 'dim' | 'match';
  color?: string;
  value?: string | number;
}

export interface AnimStep {
  id: string;
  label: string;
  description?: string;
  codeHighlight?: string;
  highlights: StepHighlight[];
  dataState: Record<string, unknown>;
}

export interface InputField {
  key: string;
  label: string;
  type: 'array' | 'string' | 'number';
  defaultValue: unknown;
  editable: boolean;
}

export interface ThinkingSteps {
  logic: string;
  decomposition: string;
  translation: string;
}

export interface VisualConfig {
  questionId: string;
  template: VisualizationTemplate;
  title: string;
  subtitle: string;
  category: 'python' | 'sql';
  thinking: ThinkingSteps;
  pseudoCode: string;
  solutionCode: string;
  inputs: InputField[];
  generateSteps: (inputs: Record<string, unknown>) => AnimStep[];
}
