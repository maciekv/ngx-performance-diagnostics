/**
 * Basic Usage Example
 *
 * This example shows the most common way to integrate
 * ngx-performance-diagnostics into your Angular application.
 */

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdMonitorPanelComponent,
  MemoryLeakPanelComponent,
  ChangeDetectionMonitorDirective
} from 'ngx-performance-diagnostics';

// App Component - Add diagnostic panels here
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CdMonitorPanelComponent,
    MemoryLeakPanelComponent,
  ],
  template: `
    <router-outlet></router-outlet>

    <!-- Diagnostic panels (only in development) -->
    @if (!isProduction) {
      <ngx-cd-monitor-panel></ngx-cd-monitor-panel>
      <ngx-memory-leak-panel></ngx-memory-leak-panel>
    }
  `
})
export class AppComponent {
  isProduction = false; // Set from environment config
}

// Regular Component - Add monitoring directive
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChangeDetectionMonitorDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush, // Recommended!
  template: `
    <div cdMonitor="DashboardComponent">
      <h1>Dashboard</h1>
      <p>Total users: {{ totalUsers }}</p>
    </div>
  `
})
export class DashboardComponent {
  totalUsers = 0;
}

// Component with Custom Threshold
@Component({
  selector: 'app-critical-component',
  standalone: true,
  imports: [ChangeDetectionMonitorDirective],
  template: `
    <!-- Lower threshold for critical components -->
    <div cdMonitor="CriticalComponent" [cdMonitorThreshold]="30">
      <!-- Content -->
    </div>
  `
})
export class CriticalComponent {}
