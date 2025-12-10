export interface ComponentStats {
  componentName: string;
  totalChecks: number;
  checksPerSecond: number;
  elapsedSeconds: number;
  averageTimeBetweenChecks: number;
  minTimeBetweenChecks: number;
  maxTimeBetweenChecks: number;
  isProblematic: boolean;
  element: HTMLElement;
}

export interface MonitorSummary {
  activeComponents: string[];
  problematicComponents: string[];
  stats: Map<string, ComponentStats>;
}

export interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  percentUsed: number;
}

export interface MemoryLeakReport {
  isLeaking: boolean;
  trendPercentPerMinute: number;
  snapshots: MemorySnapshot[];
  averageGrowth: number;
  maxMemory: number;
  currentMemory: number;
}
