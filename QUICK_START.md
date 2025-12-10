# Quick Start Guide

Get up and running with ngx-performance-diagnostics in 5 minutes!

## 📦 Installation

```bash
npm install ngx-performance-diagnostics --save-dev
```

## 🚀 Basic Usage

### 1. Add to App Component

```typescript
// app.component.ts
import {
  CdMonitorPanelComponent,
  MemoryLeakPanelComponent
} from 'ngx-performance-diagnostics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CdMonitorPanelComponent,
    MemoryLeakPanelComponent
  ],
  template: `
    <router-outlet></router-outlet>
    <ngx-cd-monitor-panel></ngx-cd-monitor-panel>
    <ngx-memory-leak-panel></ngx-memory-leak-panel>
  `
})
export class AppComponent {}
```

### 2. Monitor a Component

```typescript
// my-component.ts
import { ChangeDetectionMonitorDirective } from 'ngx-performance-diagnostics';

@Component({
  selector: 'app-my-component',
  imports: [ChangeDetectionMonitorDirective],
  template: `
    <div cdMonitor="MyComponent">
      <h1>{{ title }}</h1>
    </div>
  `
})
export class MyComponent {
  title = 'Hello World';
}
```

### 3. Run Chrome with Flags

```bash
# macOS
open -a "Google Chrome" --args --enable-precise-memory-info --expose-gc

# Windows
chrome.exe --enable-precise-memory-info --expose-gc
```

### 4. Check Results

1. Open your app
2. Click "Start" in Memory Panel (left)
3. Wait 1-2 minutes
4. Check for warnings

## 🎯 What to Look For

### Change Detection (Right Panel)

```
Component: 174.3 c/s ← BAD! (should be < 50)
Component: 8.2 c/s   ← GOOD!
```

### Memory (Left Panel)

```
Trend: 5.67% /min ← LEAK! (should be < 2%)
Trend: 0.34% /min ← GOOD!
```

## 🔧 Quick Fixes

### Too Many CD Cycles?

```typescript
// Change from Default to OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Memory Leak?

```typescript
// Use takeUntil for subscriptions
private destroy$ = new Subject<void>();

ngOnInit() {
  this.data$.pipe(takeUntil(this.destroy$)).subscribe(/*...*/);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## 📖 Next Steps

- Read [README.md](README.md) for full documentation
- Check [examples/](examples/) for more use cases
- Visit [Issues](https://github.com/yourusername/ngx-performance-diagnostics/issues) for help

Happy debugging! 🐛
