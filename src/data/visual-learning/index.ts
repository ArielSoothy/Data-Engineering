import type { VisualConfig } from '../../components/visual-learning/types';
import pythonConfigs from './pythonConfigs';
import { sqlVisualConfigs } from './sqlConfigs';

export const allVisualConfigs: VisualConfig[] = [
  ...pythonConfigs,
  ...sqlVisualConfigs,
];

export const pythonVisualConfigs = pythonConfigs;
export { sqlVisualConfigs };
