import { Injectable, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({providedIn: 'root'})
export class ThemeService {
  preference = signal<ThemePreference>('system');
  dark = signal(false);
  private media?: MediaQueryList;

  init() {
    const saved = localStorage.getItem('theme');
    const preference: ThemePreference = saved === 'light' || saved === 'dark' ? saved : 'system';
    this.media = matchMedia('(prefers-color-scheme: dark)');
    this.media.addEventListener('change', () => this.apply());
    this.set(preference);
  }

  set(preference: ThemePreference) {
    this.preference.set(preference);
    localStorage.setItem('theme', preference);
    this.apply();
  }

  toggle() { this.set(this.dark() ? 'light' : 'dark'); }

  private apply() {
    const dark = this.preference() === 'dark' || (this.preference() === 'system' && !!this.media?.matches);
    this.dark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }
}
