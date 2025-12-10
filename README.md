# ngx-performance-diagnostics

> 🔍 Real-time performance monitoring and diagnostics for Angular applications

[![npm version](https://badge.fury.io/js/ngx-performance-diagnostics.svg)](https://www.npmjs.com/package/ngx-performance-diagnostics)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Detect performance issues, excessive change detection cycles, and memory leaks in your Angular applications with **zero configuration**. Perfect for development and debugging!

## ✨ Features

- 🔍 **Change Detection Monitor** - Detect components with excessive CD cycles
- 💾 **Memory Leak Detector** - Track memory usage and identify leaks
- 📊 **Visual Panels** - Real-time diagnostics UI panels
- 🎯 **Zero Config** - Works out of the box, no setup required
- 🚀 **Lightweight** - Minimal overhead, dev-only friendly
- 📦 **Standalone** - Fully compatible with Angular standalone components
- 🔧 **Flexible** - Use individual tools or full diagnostic suite

## 📦 Installation

```bash
npm install ngx-performance-diagnostics --save-dev
```

## 🚀 Quick Start

### 1. Add Diagnostic Panels to Your Layout

```typescript
import { Component } from '@angular/core';
import {
  CdMonitorPanelComponent,
  MemoryLeakPanelComponent
} from 'ngx-performance-diagnostics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // ... your imports
    CdMonitorPanelComponent,      // CD Monitor (right panel)
    MemoryLeakPanelComponent,     // Memory Monitor (left panel)
  ],
  template: `
    <router-outlet></router-outlet>

    <!-- Diagnostic panels (development only) -->
    @if (!isProduction) {
      <ngx-cd-monitor-panel></ngx-cd-monitor-panel>
      <ngx-memory-leak-panel></ngx-memory-leak-panel>
    }
  `
})
export class AppComponent {
  isProduction = false; // Set from environment
}
```

### 2. Monitor a Component

```typescript
import { Component } from '@angular/core';
import { ChangeDetectionMonitorDirective } from 'ngx-performance-diagnostics';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [ChangeDetectionMonitorDirective],
  template: `
    <div cdMonitor="MyComponent">
      <!-- Your component content -->
      <h1>{{ title }}</h1>
    </div>
  `
})
export class MyComponent {
  title = 'Hello World';
}
```

### 3. Run Chrome with Memory Profiling Flags

```bash
# macOS
open -a "Google Chrome" --args --enable-precise-memory-info --expose-gc

# Windows
chrome.exe --enable-precise-memory-info --expose-gc

# Linux
google-chrome --enable-precise-memory-info --expose-gc
```

### 4. Start Debugging!

1. Open your Angular app
2. Click **"Start"** in the Memory Panel (bottom-left)
3. Leave the app idle for 1-2 minutes
4. Check the panels for issues:
   - **CD Monitor** (bottom-right): Shows change detection statistics
   - **Memory Monitor** (bottom-left): Shows memory trends

---

## 📖 API Documentation

### Change Detection Monitor Directive

Monitor change detection cycles for any component:

```typescript
<div cdMonitor="ComponentName" [cdMonitorThreshold]="50">
  <!-- Component content -->
</div>
```

**Inputs:**
- `cdMonitor: string` - Component name for identification
- `cdMonitorThreshold: number` - Warning threshold in cycles/second (default: 100)

**What it tracks:**
- Cycles per second (c/s)
- Total checks
- Average time between checks
- Min/Max time between checks

### Change Detection Monitor Service

Programmatic access to CD statistics:

```typescript
import { ChangeDetectionMonitorService } from 'ngx-performance-diagnostics';

export class MyComponent implements OnInit {
  constructor(private cdMonitor: ChangeDetectionMonitorService) {}

  ngOnInit() {
    // Subscribe to statistics
    this.cdMonitor.stats$.subscribe(summary => {
      console.log('Active:', summary.activeComponents);
      console.log('Problematic:', summary.problematicComponents);
    });

    // Get current stats
    const stats = this.cdMonitor.getStats();

    // Export to JSON
    const json = this.cdMonitor.exportStats();

    // Clear all stats
    this.cdMonitor.clearStats();
  }
}
```

### Memory Leak Detector Service

Monitor memory usage and detect leaks:

```typescript
import { MemoryLeakDetectorService } from 'ngx-performance-diagnostics';

export class MyComponent implements OnInit, OnDestroy {
  constructor(private memoryMonitor: MemoryLeakDetectorService) {}

  ngOnInit() {
    // Start monitoring
    this.memoryMonitor.startMonitoring();

    // Get report
    const report = this.memoryMonitor.getReport();
    console.log('Is leaking:', report.isLeaking);
    console.log('Trend:', report.trendPercentPerMinute, '% per minute');

    // Export report
    const json = this.memoryMonitor.exportReport();

    // Force garbage collection (requires --expose-gc flag)
    this.memoryMonitor.forceGC();
  }

  ngOnDestroy() {
    this.memoryMonitor.stopMonitoring();
  }
}
```

### CD Monitor Panel Component

Visual panel showing change detection statistics:

```typescript
<ngx-cd-monitor-panel></ngx-cd-monitor-panel>
```

**Features:**
- Real-time component statistics
- Click component to highlight in DOM
- Export reports to JSON
- Clear statistics

### Memory Leak Panel Component

Visual panel showing memory usage:

```typescript
<ngx-memory-leak-panel></ngx-memory-leak-panel>
```

**Features:**
- Live memory chart
- Trend analysis
- Start/stop monitoring
- Force garbage collection
- Export reports to JSON

---

## 📊 Interpreting Results

### Change Detection Monitor

| c/s (cycles/sec) | Status | Action |
|------------------|--------|--------|
| < 10 | ✅ Excellent | No action needed |
| 10-50 | ⚠️ Acceptable | Monitor |
| 50-100 | 🔶 Concerning | Investigate |
| > 100 | 🚨 Critical | Fix immediately |

**Common issues:**
- Getters in templates
- Functions called in templates
- Missing `OnPush` change detection strategy
- Unsubscribed observables triggering updates

### Memory Leak Detector

| Trend %/min | Status | Action |
|-------------|--------|--------|
| < 0 | ✅ Decreasing (GC working) | OK |
| 0-2 | ✅ Stable | OK |
| 2-5 | ⚠️ Suspicious growth | Investigate |
| > 5 | 🚨 Leak detected | Fix immediately |

**Common issues:**
- Unsubscribed RxJS observables
- Event listeners not removed
- Intervals/timeouts not cleared
- Circular references
- Large objects in closures

---

## 🔧 Common Fixes

### Fix 1: Unsubscribed RxJS Observables

```typescript
// ❌ BAD
ngOnInit() {
  this.service.data$.subscribe(data => this.data = data);
}

// ✅ GOOD - Option 1: takeUntil
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.data$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// ✅ GOOD - Option 2: async pipe (preferred)
@Component({
  template: `<div>{{ data$ | async }}</div>`
})
export class MyComponent {
  data$ = this.service.data$;
}
```

### Fix 2: Getters in Templates

```typescript
// ❌ BAD - getter called on every CD cycle
get total(): number {
  return this.items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ GOOD - computed once
total = 0;

ngOnChanges() {
  this.total = this.items.reduce((sum, item) => sum + item.price, 0);
}
```

### Fix 3: OnPush Change Detection

```typescript
// ❌ BAD - Default strategy checks on every event
@Component({
  changeDetection: ChangeDetectionStrategy.Default
})

// ✅ GOOD - OnPush only checks on input changes
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Fix 4: Event Listeners

```typescript
// ❌ BAD
ngOnInit() {
  window.addEventListener('resize', this.onResize);
}

// ✅ GOOD
ngOnInit() {
  window.addEventListener('resize', this.onResize);
}

ngOnDestroy() {
  window.removeEventListener('resize', this.onResize);
}
```

---

## 🎯 Usage Patterns

### Development Only

```typescript
import { isDevMode } from '@angular/core';

@Component({
  template: `
    @if (isDevMode()) {
      <ngx-cd-monitor-panel></ngx-cd-monitor-panel>
      <ngx-memory-leak-panel></ngx-memory-leak-panel>
    }
  `
})
```

### Conditional Monitoring

```typescript
// Monitor only specific components
@Component({
  template: `
    <div [cdMonitor]="shouldMonitor ? 'MyComponent' : null">
      <!-- Content -->
    </div>
  `
})
export class MyComponent {
  shouldMonitor = !environment.production;
}
```

### Custom Thresholds

```typescript
// Lower threshold for critical components
<div cdMonitor="CriticalComponent" [cdMonitorThreshold]="30">
  <!-- Lower threshold = earlier warnings -->
</div>
```

---

## 🔬 Advanced Usage

### Programmatic Monitoring

```typescript
import {
  ChangeDetectionMonitorService,
  MemoryLeakDetectorService
} from 'ngx-performance-diagnostics';

@Component({/*...*/})
export class DiagnosticsComponent implements OnInit {
  constructor(
    private cdMonitor: ChangeDetectionMonitorService,
    private memoryMonitor: MemoryLeakDetectorService
  ) {}

  ngOnInit() {
    // Start memory monitoring
    this.memoryMonitor.startMonitoring();

    // Check every 10 seconds
    setInterval(() => {
      const cdReport = this.cdMonitor.exportStats();
      const memReport = this.memoryMonitor.exportReport();

      // Send to analytics, log to console, etc.
      this.sendToAnalytics({ cd: cdReport, memory: memReport });
    }, 10000);
  }

  sendToAnalytics(data: any) {
    // Your analytics implementation
  }
}
```

### Custom Export

```typescript
exportDiagnostics() {
  const report = {
    timestamp: new Date().toISOString(),
    changeDetection: JSON.parse(this.cdMonitor.exportStats()),
    memory: JSON.parse(this.memoryMonitor.exportReport()),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Download or send to server
  this.downloadReport(report);
}
```

---

## 🛠️ Configuration

### TypeScript Configuration

No special configuration needed! The library is built with strict mode and full type safety.

### Angular Configuration

Works with:
- ✅ Angular 17+
- ✅ Angular 18+
- ✅ Angular 19+
- ✅ Standalone components
- ✅ NgModules
- ✅ Ivy compiler

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/ngx-performance-diagnostics.git
cd ngx-performance-diagnostics

# Install dependencies
npm install

# Build library
npm run build

# Run tests
npm test
```

---

## 📝 License

MIT © [Your Name]

---

## 🙏 Acknowledgments

Built for the Angular community with ❤️

---

## 📞 Support

- 🐛 [Report Issues](https://github.com/yourusername/ngx-performance-diagnostics/issues)
- 💬 [Discussions](https://github.com/yourusername/ngx-performance-diagnostics/discussions)
- 📖 [Documentation](https://github.com/yourusername/ngx-performance-diagnostics/wiki)

---

## 🗺️ Roadmap

- [ ] Unit tests
- [ ] E2E tests
- [ ] Zone.js integration
- [ ] Performance timeline integration
- [ ] Custom reporters
- [ ] CI/CD performance checks

---

**Happy Debugging! 🐛🔍**
