import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemoryLeakDetectorService } from '../services/memory-leak-detector.service';
import { MemorySnapshot } from '../models/component-stats.model';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-memory-leak-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="memory-panel" [class.collapsed]="collapsed">
      <div class="memory-header" (click)="toggle()">
        <span class="memory-title">💾 Memory Monitor</span>
        <span class="memory-badge" *ngIf="isLeaking" [class.critical]="isCritical">
          {{ isLeaking ? 'LEAK' : 'OK' }}
        </span>
        <button class="memory-toggle">{{ collapsed ? '▲' : '▼' }}</button>
      </div>

      <div class="memory-content" *ngIf="!collapsed">
        <div class="memory-actions">
          <button
            (click)="monitoring ? stopMonitoring() : startMonitoring()"
            class="memory-btn"
            [class.active]="monitoring"
          >
            {{ monitoring ? 'Stop' : 'Start' }}
          </button>
          <button (click)="forceGC()" class="memory-btn">Force GC</button>
          <button (click)="exportReport()" class="memory-btn">Export</button>
          <button (click)="reset()" class="memory-btn">Reset</button>
        </div>

        <div class="memory-stats">
          <div class="memory-stat">
            <span class="memory-stat-label">Current:</span>
            <span class="memory-stat-value">{{ currentMemoryMB.toFixed(2) }} MB</span>
          </div>
          <div class="memory-stat">
            <span class="memory-stat-label">Max:</span>
            <span class="memory-stat-value">{{ maxMemoryMB.toFixed(2) }} MB</span>
          </div>
          <div class="memory-stat" [class.warning]="trendPercent > 2">
            <span class="memory-stat-label">Trend:</span>
            <span class="memory-stat-value">{{ trendPercent.toFixed(2) }}% /min</span>
          </div>
          <div class="memory-stat">
            <span class="memory-stat-label">Growth:</span>
            <span class="memory-stat-value">{{ averageGrowth.toFixed(2) }} MB/min</span>
          </div>
        </div>

        <div class="memory-chart">
          <svg width="100%" height="100" *ngIf="snapshots.length > 0">
            <polyline
              [attr.points]="chartPoints"
              fill="none"
              stroke="#4CAF50"
              stroke-width="2"
            />
            <polyline
              *ngIf="isLeaking"
              [attr.points]="chartPoints"
              fill="none"
              stroke="#ff4444"
              stroke-width="2"
            />
          </svg>
          <div class="memory-chart-empty" *ngIf="snapshots.length === 0">
            No data yet. Click "Start" to begin monitoring.
          </div>
        </div>

        <div class="memory-info" *ngIf="isLeaking">
          <div class="memory-warning">
            ⚠️ Potential memory leak detected!
          </div>
          <div class="memory-suggestion">
            Check for:
            <ul>
              <li>Unsubscribed RxJS observables</li>
              <li>Event listeners not removed</li>
              <li>Circular references</li>
              <li>Large objects in closures</li>
            </ul>
          </div>
        </div>

        <div class="memory-snapshots">
          <div class="memory-snapshots-header">
            Recent snapshots ({{ snapshots.length }}/60)
          </div>
          <div class="memory-snapshot-list">
            <div
              *ngFor="let snapshot of recentSnapshots"
              class="memory-snapshot"
            >
              <span class="memory-snapshot-time">{{ formatTime(snapshot.timestamp) }}</span>
              <span class="memory-snapshot-value">{{ formatMemory(snapshot.usedJSHeapSize) }} MB</span>
              <span class="memory-snapshot-percent" [class.critical]="snapshot.percentUsed > 90">
                {{ snapshot.percentUsed.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .memory-panel {
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 450px;
      max-height: 700px;
      background: rgba(0, 0, 0, 0.95);
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      font-family: 'Courier New', monospace;
      font-size: 12px;
      z-index: 10000;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .memory-panel.collapsed {
      max-height: 50px;
    }

    .memory-header {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #1a1a1a;
      cursor: pointer;
      user-select: none;
    }

    .memory-title {
      flex: 1;
      font-weight: bold;
      font-size: 14px;
    }

    .memory-badge {
      background: #4CAF50;
      color: #fff;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      margin-right: 8px;
    }

    .memory-badge.critical {
      background: #ff4444;
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .memory-toggle {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
    }

    .memory-content {
      max-height: 650px;
      overflow-y: auto;
    }

    .memory-actions {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 12px;
      border-bottom: 1px solid #333;
    }

    .memory-btn {
      padding: 6px 12px;
      background: #333;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      transition: background 0.2s;
    }

    .memory-btn:hover {
      background: #444;
    }

    .memory-btn.active {
      background: #4CAF50;
    }

    .memory-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 12px;
      border-bottom: 1px solid #333;
    }

    .memory-stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .memory-stat.warning {
      color: #ff4444;
    }

    .memory-stat-label {
      color: #888;
      font-size: 10px;
    }

    .memory-stat-value {
      font-weight: bold;
      font-size: 16px;
    }

    .memory-chart {
      padding: 12px;
      border-bottom: 1px solid #333;
      background: #0a0a0a;
    }

    .memory-chart-empty {
      padding: 20px;
      text-align: center;
      color: #666;
    }

    .memory-info {
      padding: 12px;
      border-bottom: 1px solid #333;
    }

    .memory-warning {
      color: #ff4444;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .memory-suggestion {
      font-size: 11px;
      color: #ccc;
    }

    .memory-suggestion ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }

    .memory-suggestion li {
      margin: 4px 0;
    }

    .memory-snapshots {
      padding: 12px;
    }

    .memory-snapshots-header {
      font-weight: bold;
      margin-bottom: 8px;
      color: #4CAF50;
    }

    .memory-snapshot-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .memory-snapshot {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 8px;
      padding: 6px 8px;
      background: #1a1a1a;
      border-radius: 4px;
      margin-bottom: 4px;
      font-size: 11px;
    }

    .memory-snapshot-time {
      color: #888;
    }

    .memory-snapshot-value {
      color: #fff;
    }

    .memory-snapshot-percent {
      color: #4CAF50;
      font-weight: bold;
    }

    .memory-snapshot-percent.critical {
      color: #ff4444;
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #1a1a1a;
    }

    ::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `],
})
export class MemoryLeakPanelComponent implements OnInit, OnDestroy {
  collapsed = false;
  monitoring = false;
  isLeaking = false;
  isCritical = false;
  currentMemoryMB = 0;
  maxMemoryMB = 0;
  trendPercent = 0;
  averageGrowth = 0;
  snapshots: MemorySnapshot[] = [];
  chartPoints = '';

  private destroy$ = new Subject<void>();

  constructor(private memoryService: MemoryLeakDetectorService) {}

  ngOnInit(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateStats();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  startMonitoring(): void {
    this.memoryService.startMonitoring();
    this.monitoring = true;
  }

  stopMonitoring(): void {
    this.memoryService.stopMonitoring();
    this.monitoring = false;
  }

  forceGC(): void {
    this.memoryService.forceGC();
  }

  exportReport(): void {
    const json = this.memoryService.exportReport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  reset(): void {
    this.memoryService.reset();
    this.snapshots = [];
  }

  get recentSnapshots(): MemorySnapshot[] {
    return this.snapshots.slice(-10).reverse();
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pl-PL');
  }

  formatMemory(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(2);
  }

  private updateStats(): void {
    const report = this.memoryService.getReport();

    this.isLeaking = report.isLeaking;
    this.currentMemoryMB = report.currentMemory / (1024 * 1024);
    this.maxMemoryMB = report.maxMemory / (1024 * 1024);
    this.trendPercent = report.trendPercentPerMinute;
    this.averageGrowth = report.averageGrowth;
    this.snapshots = report.snapshots;

    const currentPercent = report.snapshots.length > 0
      ? report.snapshots[report.snapshots.length - 1].percentUsed
      : 0;
    this.isCritical = currentPercent > 90;

    this.updateChart();
  }

  private updateChart(): void {
    if (this.snapshots.length < 2) {
      this.chartPoints = '';
      return;
    }

    const width = 100; // percentage
    const height = 100;
    const padding = 10;

    const minMemory = Math.min(...this.snapshots.map(s => s.usedJSHeapSize));
    const maxMemory = Math.max(...this.snapshots.map(s => s.usedJSHeapSize));
    const memoryRange = maxMemory - minMemory || 1;

    const points = this.snapshots.map((snapshot, index) => {
      const x = (index / (this.snapshots.length - 1)) * (width - 2 * padding) + padding;
      const normalizedMemory = (snapshot.usedJSHeapSize - minMemory) / memoryRange;
      const y = height - padding - normalizedMemory * (height - 2 * padding);
      return `${x},${y}`;
    });

    this.chartPoints = points.join(' ');
  }
}
