import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

export type ThemePreference = 'light' | 'dark';

const STORAGE_KEY = 'brookyshop-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark$ = new BehaviorSubject(false);

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly meta: Meta,
  ) {}

  initThemeFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode =
      stored === 'light' || stored === 'dark' ? stored : prefersDark ? 'dark' : 'light';
    this.applyMode(mode);
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const next = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
    this.applyMode(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  private applyMode(mode: ThemePreference): void {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('theme-dark');
    } else {
      root.classList.remove('theme-dark');
    }
    this.meta.updateTag({ name: 'color-scheme', content: mode });
    this.dark$.next(mode === 'dark');
  }
}
