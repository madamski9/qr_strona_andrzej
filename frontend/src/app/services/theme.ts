import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private current: Theme;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.current =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    this.apply();
  }

  get theme(): Theme {
    return this.current;
  }

  toggle(): void {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, this.current);
    this.apply();
  }

  private apply(): void {
    document.documentElement.setAttribute('data-theme', this.current);
  }
}
