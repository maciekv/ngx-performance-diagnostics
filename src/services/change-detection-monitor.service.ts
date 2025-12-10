import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ComponentStats, MonitorSummary } from '../models/component-stats.model';

@Injectable({
  providedIn: 'root',
})
export class ChangeDetectionMonitorService {
  private stats = new Map<string, ComponentStats>();
  private statsSubject = new BehaviorSubject<MonitorSummary>(this.getSummary());

  stats$: Observable<MonitorSummary> = this.statsSubject.asObservable();

  registerComponent(componentName: string): void {
    console.log(`[CD Monitor] Registered: ${componentName}`);
  }

  unregisterComponent(componentName: string): void {
    console.log(`[CD Monitor] Unregisterred: ${componentName}`);
    this.stats.delete(componentName);
    this.emitUpdate();
  }

  updateStats(stats: ComponentStats): void {
    this.stats.set(stats.componentName, stats);

    if (stats.isProblematic) {
      console.warn(
        `[CD Monitor] ⚠️ Problematic component detected: ${stats.componentName}\n` +
        `  Checks per second: ${stats.checksPerSecond.toFixed(2)}\n` +
        `  Average time between checks: ${stats.averageTimeBetweenChecks.toFixed(2)}ms\n` +
        `  Min/Max time: ${stats.minTimeBetweenChecks.toFixed(2)}ms / ${stats.maxTimeBetweenChecks.toFixed(2)}ms`,
        stats.element
      );
    }

    this.emitUpdate();
  }

  private getSummary(): MonitorSummary {
    const activeComponents: string[] = [];
    const problematicComponents: string[] = [];

    this.stats.forEach((stat, name) => {
      activeComponents.push(name);
      if (stat.isProblematic) {
        problematicComponents.push(name);
      }
    });

    return {
      activeComponents,
      problematicComponents,
      stats: new Map(this.stats),
    };
  }

  private emitUpdate(): void {
    this.statsSubject.next(this.getSummary());
  }

  getStats(): Map<string, ComponentStats> {
    return new Map(this.stats);
  }

  clearStats(): void {
    this.stats.clear();
    this.emitUpdate();
  }

  exportStats(): string {
    const summary = this.getSummary();
    const statsArray = Array.from(summary.stats.values());

    const report = {
      timestamp: new Date().toISOString(),
      activeComponents: summary.activeComponents.length,
      problematicComponents: summary.problematicComponents.length,
      components: statsArray.map(stat => ({
        name: stat.componentName,
        totalChecks: stat.totalChecks,
        checksPerSecond: Math.round(stat.checksPerSecond * 100) / 100,
        averageTimeBetweenChecks: Math.round(stat.averageTimeBetweenChecks * 100) / 100,
        minTimeBetweenChecks: Math.round(stat.minTimeBetweenChecks * 100) / 100,
        maxTimeBetweenChecks: Math.round(stat.maxTimeBetweenChecks * 100) / 100,
        isProblematic: stat.isProblematic,
      })).sort((a, b) => b.checksPerSecond - a.checksPerSecond),
    };

    return JSON.stringify(report, null, 2);
  }
}
