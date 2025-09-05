import { ComponentType } from 'react';

export interface NodeOutput {
  id: string;
  name: string;
}

export interface ComponentLibraryItem {
  type: 'Input' | 'Feature' | 'Model' | 'Rule' | 'Logic' | 'Action';
  label: string;
  icon: ComponentType<{ className?: string }>;
  outputs?: NodeOutput[];
  inputs?: number;
}