/**
 * Environment-Based Usage Example
 *
 * This example shows how to conditionally enable diagnostics
 * based on environment configuration.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdMonitorPanelComponent,
  MemoryLeakPanelComponent,
  ChangeDetectionMonitorDirective
} from 'ngx-performance-diagnostics';

// Environment configuration
export const environment = {
  production: false,
  enableDiagnostics: true, // Control diagnostics separately
  diagnosticsThreshold: 50 // Custom threshold
};

// App Component with environment-based diagnostics
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

    <!-- Show panels based on environment -->
    @if (showDiagnostics) {
      <ngx-cd-monitor-panel></ngx-cd-monitor-panel>
      <ngx-memory-leak-panel></ngx-memory-leak-panel>
    }
  `
})
export class AppComponent {
  showDiagnostics = environment.enableDiagnostics && !environment.production;
}

// Component with environment-based monitoring
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [
    CommonModule,
    ChangeDetectionMonitorDirective
  ],
  template: `
    <div [cdMonitor]="shouldMonitor ? 'FeatureComponent' : null"
         [cdMonitorThreshold]="threshold">
      <h1>Feature Component</h1>
    </div>
  `
})
export class FeatureComponent {
  shouldMonitor = environment.enableDiagnostics;
  threshold = environment.diagnosticsThreshold;
}

// Production-safe wrapper
@Component({
  selector: 'app-safe-diagnostics',
  template: `
    @if (isDevelopment) {
      <div class="diagnostics-wrapper">
        <ngx-cd-monitor-panel></ngx-cd-monitor-panel>
        <ngx-memory-leak-panel></ngx-memory-leak-panel>
      </div>
    }
  `,
  styles: [`
    .diagnostics-wrapper {
      /* Optional: Add custom styling */
    }
  `]
})
export class SafeDiagnosticsComponent {
  // Multiple checks ensure it's safe for production
  isDevelopment = !environment.production &&
                  environment.enableDiagnostics &&
                  typeof window !== 'undefined' &&
                  window.location.hostname === 'localhost';
}
