import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  inject,
  AfterViewInit,
  AfterViewChecked,
} from '@angular/core';
import { ChangeDetectionMonitorService } from '../services/change-detection-monitor.service';

/**
 * Directive for monitoring change detection cycles in a component
 *
 * Usage:
 * ```html
 * <div cdMonitor="ComponentName">...</div>
 * ```
 *
 * With custom threshold:
 * ```html
 * <div cdMonitor="ComponentName" [cdMonitorThreshold]="50">...</div>
 * ```
 */
@Directive({
  selector: '[cdMonitor]',
  standalone: true,
})
export class ChangeDetectionMonitorDirective implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  private monitorService = inject(ChangeDetectionMonitorService);
  private cdr = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);

  @Input() cdMonitor: string = 'Unknown';
  @Input() cdMonitorThreshold: number = 100;

  private checkCount = 0;
  private intervalId?: number;
  private startTime = 0;
  private lastCheckTime = 0;
  private timeBetweenChecks: number[] = [];
  private isViewInitialized = false;

  ngOnInit(): void {
    this.startTime = performance.now();
    this.monitorService.registerComponent(this.cdMonitor);

    this.intervalId = window.setInterval(() => {
      this.reportStats();
    }, 1000);
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
  }

  ngAfterViewChecked(): void {
    if (!this.isViewInitialized) {
      return;
    }

    this.checkCount++;
    const now = performance.now();

    if (this.lastCheckTime > 0) {
      const timeDiff = now - this.lastCheckTime;
      this.timeBetweenChecks.push(timeDiff);

      if (this.timeBetweenChecks.length > 100) {
        this.timeBetweenChecks.shift();
      }
    }

    this.lastCheckTime = now;
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.reportStats();
    this.monitorService.unregisterComponent(this.cdMonitor);
  }

  private reportStats(): void {
    const now = performance.now();
    const elapsedSeconds = (now - this.startTime) / 1000;
    const checksPerSecond = this.checkCount / elapsedSeconds;

    let averageTimeBetweenChecks = 0;
    let minTimeBetweenChecks = 0;
    let maxTimeBetweenChecks = 0;

    if (this.timeBetweenChecks.length > 0) {
      averageTimeBetweenChecks = this.timeBetweenChecks.reduce((a, b) => a + b, 0) / this.timeBetweenChecks.length;
      minTimeBetweenChecks = Math.min(...this.timeBetweenChecks);
      maxTimeBetweenChecks = Math.max(...this.timeBetweenChecks);
    }

    const stats = {
      componentName: this.cdMonitor,
      totalChecks: this.checkCount,
      checksPerSecond,
      elapsedSeconds,
      averageTimeBetweenChecks,
      minTimeBetweenChecks,
      maxTimeBetweenChecks,
      isProblematic: checksPerSecond > this.cdMonitorThreshold,
      element: this.elementRef.nativeElement,
    };

    this.monitorService.updateStats(stats);

    this.checkCount = 0;
    this.startTime = now;
    this.timeBetweenChecks = [];
  }
}
