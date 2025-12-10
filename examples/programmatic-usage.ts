/**
 * Programmatic Usage Example
 *
 * This example shows how to use the services directly
 * for custom monitoring and reporting.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ChangeDetectionMonitorService,
  MemoryLeakDetectorService
} from 'ngx-performance-diagnostics';

@Component({
  selector: 'app-diagnostics',
  template: `
    <div>
      <button (click)="startMonitoring()">Start</button>
      <button (click)="stopMonitoring()">Stop</button>
      <button (click)="exportReport()">Export Report</button>

      <div *ngIf="report">
        <h3>Performance Report</h3>
        <p>Problematic components: {{ report.problematicCount }}</p>
        <p>Memory trend: {{ report.memoryTrend }}%/min</p>
      </div>
    </div>
  `
})
export class DiagnosticsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  report: any = null;

  constructor(
    private cdMonitor: ChangeDetectionMonitorService,
    private memoryMonitor: MemoryLeakDetectorService
  ) {}

  ngOnInit() {
    // Subscribe to change detection statistics
    this.cdMonitor.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        console.log('Active components:', summary.activeComponents);
        console.log('Problematic:', summary.problematicComponents);
      });

    // Auto-report every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.generateReport();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.memoryMonitor.stopMonitoring();
  }

  startMonitoring() {
    this.memoryMonitor.startMonitoring();
  }

  stopMonitoring() {
    this.memoryMonitor.stopMonitoring();
  }

  generateReport() {
    const cdStats = this.cdMonitor.getStats();
    const memoryReport = this.memoryMonitor.getReport();

    this.report = {
      problematicCount: Array.from(cdStats.values())
        .filter(s => s.isProblematic).length,
      memoryTrend: memoryReport.trendPercentPerMinute.toFixed(2),
      isMemoryLeaking: memoryReport.isLeaking
    };

    // Send to analytics, log server, etc.
    console.log('Performance Report:', this.report);
  }

  exportReport() {
    const report = {
      timestamp: new Date().toISOString(),
      changeDetection: JSON.parse(this.cdMonitor.exportStats()),
      memory: JSON.parse(this.memoryMonitor.exportReport()),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Force garbage collection (requires --expose-gc)
  forceGC() {
    this.memoryMonitor.forceGC();
  }
}
