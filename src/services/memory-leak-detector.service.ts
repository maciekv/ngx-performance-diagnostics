import { Injectable, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MemorySnapshot, MemoryLeakReport } from '../models/component-stats.model';

@Injectable({
  providedIn: 'root',
})
export class MemoryLeakDetectorService implements OnDestroy {
  private snapshots: MemorySnapshot[] = [];
  private destroy$ = new Subject<void>();
  private monitoringActive = false;
  private readonly maxSnapshots = 60;
  private readonly leakThresholdPercent = 2;

  startMonitoring(): void {
    if (this.monitoringActive) {
      console.warn('[Memory Leak Detector] Monitoring already active');
      return;
    }

    if (!this.isMemoryAPIAvailable()) {
      console.warn(
        '[Memory Leak Detector] Memory API not available. Run Chrome with --enable-precise-memory-info'
      );
      return;
    }

    this.monitoringActive = true;
    console.log('[Memory Leak Detector] Started monitoring');

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.takeSnapshot();
      });
  }

  stopMonitoring(): void {
    this.monitoringActive = false;
    this.destroy$.next();
    console.log('[Memory Leak Detector] Stopped monitoring');
  }

  getReport(): MemoryLeakReport {
    if (this.snapshots.length < 10) {
      return {
        isLeaking: false,
        trendPercentPerMinute: 0,
        snapshots: [...this.snapshots],
        averageGrowth: 0,
        maxMemory: 0,
        currentMemory: 0,
      };
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const timeElapsedMinutes = (last.timestamp - first.timestamp) / 60000;

    const memoryGrowthMB =
      (last.usedJSHeapSize - first.usedJSHeapSize) / (1024 * 1024);
    const percentGrowth =
      ((last.usedJSHeapSize - first.usedJSHeapSize) / first.usedJSHeapSize) *
      100;
    const trendPercentPerMinute = percentGrowth / timeElapsedMinutes;

    const maxMemory = Math.max(...this.snapshots.map(s => s.usedJSHeapSize));
    const currentMemory = last.usedJSHeapSize;

    const averageGrowth = memoryGrowthMB / timeElapsedMinutes;

    const isLeaking =
      trendPercentPerMinute > this.leakThresholdPercent &&
      this.isConsistentlyGrowing();

    if (isLeaking) {
      console.warn(
        `[Memory Leak Detector] ⚠️ Potential memory leak detected!\n` +
          `  Trend: ${trendPercentPerMinute.toFixed(2)}% per minute\n` +
          `  Average growth: ${averageGrowth.toFixed(2)} MB/min\n` +
          `  Current memory: ${(currentMemory / (1024 * 1024)).toFixed(2)} MB\n` +
          `  Max memory: ${(maxMemory / (1024 * 1024)).toFixed(2)} MB`
      );
    }

    return {
      isLeaking,
      trendPercentPerMinute,
      snapshots: [...this.snapshots],
      averageGrowth,
      maxMemory,
      currentMemory,
    };
  }

  exportReport(): string {
    const report = this.getReport();
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        isLeaking: report.isLeaking,
        trendPercentPerMinute: Math.round(report.trendPercentPerMinute * 100) / 100,
        averageGrowthMBPerMinute: Math.round(report.averageGrowth * 100) / 100,
        currentMemoryMB: Math.round((report.currentMemory / (1024 * 1024)) * 100) / 100,
        maxMemoryMB: Math.round((report.maxMemory / (1024 * 1024)) * 100) / 100,
        snapshots: report.snapshots.map(s => ({
          timestamp: new Date(s.timestamp).toISOString(),
          usedMB: Math.round((s.usedJSHeapSize / (1024 * 1024)) * 100) / 100,
          totalMB: Math.round((s.totalJSHeapSize / (1024 * 1024)) * 100) / 100,
          percentUsed: Math.round(s.percentUsed * 100) / 100,
        })),
      },
      null,
      2
    );
  }

  reset(): void {
    this.snapshots = [];
    console.log('[Memory Leak Detector] Reset snapshots');
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
    this.destroy$.complete();
  }

  private takeSnapshot(): void {
    if (!this.isMemoryAPIAvailable()) {
      return;
    }

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      percentUsed: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };

    this.snapshots.push(snapshot);

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    if (snapshot.percentUsed > 90) {
      console.error(
        `[Memory Leak Detector] 🚨 CRITICAL: Memory usage at ${snapshot.percentUsed.toFixed(1)}%`
      );
    }
  }

  private isMemoryAPIAvailable(): boolean {
    return (
      typeof performance !== 'undefined' &&
      (performance as any).memory !== undefined
    );
  }

  private isConsistentlyGrowing(): boolean {
    if (this.snapshots.length < 5) {
      return false;
    }

    let growthCount = 0;
    for (let i = 1; i < this.snapshots.length; i++) {
      if (
        this.snapshots[i].usedJSHeapSize >
        this.snapshots[i - 1].usedJSHeapSize
      ) {
        growthCount++;
      }
    }

    const growthPercent = (growthCount / (this.snapshots.length - 1)) * 100;
    return growthPercent > 70;
  }

  forceGC(): void {
    if ((window as any).gc) {
      console.log('[Memory Leak Detector] Forcing garbage collection...');
      (window as any).gc();
      setTimeout(() => {
        this.takeSnapshot();
        console.log('[Memory Leak Detector] GC completed, new snapshot taken');
      }, 100);
    } else {
      console.warn(
        '[Memory Leak Detector] GC not available. Run Chrome with --expose-gc flag'
      );
    }
  }
}
