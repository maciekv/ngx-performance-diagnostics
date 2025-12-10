# Examples

This directory contains usage examples for ngx-performance-diagnostics.

## Available Examples

### 1. [basic-usage.ts](basic-usage.ts)
The most common integration pattern. Shows:
- Adding diagnostic panels to app component
- Monitoring individual components
- Using custom thresholds

**Use this if:** You're getting started

### 2. [programmatic-usage.ts](programmatic-usage.ts)
Advanced usage with services. Shows:
- Direct service usage
- Custom reporting
- Automated monitoring
- Exporting custom reports

**Use this if:** You need programmatic control or custom analytics

### 3. [environment-based.ts](environment-based.ts)
Production-safe patterns. Shows:
- Conditional enabling based on environment
- Multiple safety checks
- Custom thresholds from config

**Use this if:** You want environment-specific behavior

## Quick Copy-Paste

### Minimal Setup

```typescript
import {
  CdMonitorPanelComponent,
  MemoryLeakPanelComponent
} from 'ngx-performance-diagnostics';

@Component({
  imports: [CdMonitorPanelComponent, MemoryLeakPanelComponent],
  template: `
    <router-outlet></router-outlet>
    <ngx-cd-monitor-panel></ngx-cd-monitor-panel>
    <ngx-memory-leak-panel></ngx-memory-leak-panel>
  `
})
export class AppComponent {}
```

### Monitor a Component

```typescript
import { ChangeDetectionMonitorDirective } from 'ngx-performance-diagnostics';

@Component({
  imports: [ChangeDetectionMonitorDirective],
  template: `<div cdMonitor="MyComponent">...</div>`
})
export class MyComponent {}
```

## Running Examples

These are TypeScript examples meant to be copied into your project.
They are not executable standalone files.

## Need More Help?

- See [README.md](../README.md) for full documentation
- Check [QUICK_START.md](../QUICK_START.md) for quick setup
- Open an [issue](https://github.com/yourusername/ngx-performance-diagnostics/issues) if you need help
