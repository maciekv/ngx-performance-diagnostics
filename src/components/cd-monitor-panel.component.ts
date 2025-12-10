import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectionMonitorService } from '../services/change-detection-monitor.service';
import { ComponentStats } from '../models/component-stats.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ngx-cd-monitor-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cd-monitor-panel" [class.collapsed]="collapsed">
      <div class="cd-monitor-header" (click)="toggle()">
        <span class="cd-monitor-title">🔍 CD Monitor</span>
        <span class="cd-monitor-badge" *ngIf="problematicCount > 0">
          {{ problematicCount }}
        </span>
        <button class="cd-monitor-toggle">{{ collapsed ? '▲' : '▼' }}</button>
      </div>

      <div class="cd-monitor-content" *ngIf="!collapsed">
        <div class="cd-monitor-actions">
          <button (click)="clearStats()" class="cd-monitor-btn">Clear</button>
          <button (click)="exportStats()" class="cd-monitor-btn">Export JSON</button>
        </div>

        <div class="cd-monitor-summary">
          <div class="cd-monitor-stat">
            <span class="cd-monitor-stat-label">Active:</span>
            <span class="cd-monitor-stat-value">{{ activeComponents.length }}</span>
          </div>
          <div class="cd-monitor-stat warning" *ngIf="problematicCount > 0">
            <span class="cd-monitor-stat-label">⚠️ Problematic:</span>
            <span class="cd-monitor-stat-value">{{ problematicCount }}</span>
          </div>
        </div>

        <div class="cd-monitor-list">
          <div
            *ngFor="let stat of sortedStats"
            class="cd-monitor-item"
            [class.problematic]="stat.isProblematic"
            (click)="highlightElement(stat.element)"
          >
            <div class="cd-monitor-item-header">
              <span class="cd-monitor-item-name">{{ stat.componentName }}</span>
              <span class="cd-monitor-item-cps" [class.warning]="stat.isProblematic">
                {{ stat.checksPerSecond.toFixed(1) }} c/s
              </span>
            </div>
            <div class="cd-monitor-item-details">
              <span>Total: {{ stat.totalChecks }}</span>
              <span>Avg: {{ stat.averageTimeBetweenChecks.toFixed(1) }}ms</span>
              <span>Min: {{ stat.minTimeBetweenChecks.toFixed(1) }}ms</span>
              <span>Max: {{ stat.maxTimeBetweenChecks.toFixed(1) }}ms</span>
            </div>
          </div>

          <div *ngIf="sortedStats.length === 0" class="cd-monitor-empty">
            No monitored components. Add [cdMonitor] directive to components.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cd-monitor-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-height: 600px;
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

    .cd-monitor-panel.collapsed {
      max-height: 50px;
    }

    .cd-monitor-header {
      display: flex;
      align-items: center;
      padding: 12px;
      background: #1a1a1a;
      cursor: pointer;
      user-select: none;
    }

    .cd-monitor-title {
      flex: 1;
      font-weight: bold;
      font-size: 14px;
    }

    .cd-monitor-badge {
      background: #ff4444;
      color: #fff;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      margin-right: 8px;
    }

    .cd-monitor-toggle {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      padding: 0;
    }

    .cd-monitor-content {
      max-height: 550px;
      overflow-y: auto;
    }

    .cd-monitor-actions {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-bottom: 1px solid #333;
    }

    .cd-monitor-btn {
      flex: 1;
      padding: 6px 12px;
      background: #333;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
    }

    .cd-monitor-btn:hover {
      background: #444;
    }

    .cd-monitor-summary {
      display: flex;
      gap: 16px;
      padding: 12px;
      border-bottom: 1px solid #333;
    }

    .cd-monitor-stat {
      display: flex;
      gap: 8px;
    }

    .cd-monitor-stat.warning {
      color: #ff4444;
    }

    .cd-monitor-stat-label {
      color: #888;
    }

    .cd-monitor-stat-value {
      font-weight: bold;
    }

    .cd-monitor-list {
      padding: 8px;
    }

    .cd-monitor-item {
      padding: 8px;
      margin-bottom: 8px;
      background: #1a1a1a;
      border-radius: 4px;
      border: 1px solid #333;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cd-monitor-item:hover {
      background: #252525;
      border-color: #666;
    }

    .cd-monitor-item.problematic {
      border-color: #ff4444;
      background: rgba(255, 68, 68, 0.1);
    }

    .cd-monitor-item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .cd-monitor-item-name {
      font-weight: bold;
      color: #4CAF50;
    }

    .cd-monitor-item.problematic .cd-monitor-item-name {
      color: #ff4444;
    }

    .cd-monitor-item-cps {
      font-weight: bold;
      color: #2196F3;
    }

    .cd-monitor-item-cps.warning {
      color: #ff4444;
    }

    .cd-monitor-item-details {
      display: flex;
      gap: 12px;
      font-size: 10px;
      color: #888;
    }

    .cd-monitor-empty {
      padding: 20px;
      text-align: center;
      color: #666;
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
export class CdMonitorPanelComponent implements OnInit, OnDestroy {
  collapsed = false;
  activeComponents: string[] = [];
  problematicCount = 0;
  sortedStats: ComponentStats[] = [];

  private destroy$ = new Subject<void>();

  constructor(private monitorService: ChangeDetectionMonitorService) {}

  ngOnInit(): void {
    this.monitorService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.activeComponents = summary.activeComponents;
        this.problematicCount = summary.problematicComponents.length;
        this.sortedStats = Array.from(summary.stats.values())
          .sort((a, b) => b.checksPerSecond - a.checksPerSecond);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  clearStats(): void {
    this.monitorService.clearStats();
  }

  exportStats(): void {
    const json = this.monitorService.exportStats();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cd-monitor-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  highlightElement(element: HTMLElement): void {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.style.outline = '3px solid #ff4444';
    element.style.outlineOffset = '2px';

    setTimeout(() => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }, 2000);
  }
}
