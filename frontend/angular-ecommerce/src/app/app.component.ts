import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild, inject, afterNextRender } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { filter, map, shareReplay, startWith } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild(MatSidenav) drawer!: MatSidenav;

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);

  readonly isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map((r) => r.matches),
    shareReplay(1),
  );

  readonly isLoginPage$ = this.router.events.pipe(
    filter((e) => e instanceof NavigationEnd),
    map((e) => (e as NavigationEnd).urlAfterRedirects === '/login'),
    startWith(false),
    shareReplay(1),
  );

  constructor() {
    afterNextRender(() => {
      this.themeService.initThemeFromStorage();
    });
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const isSmall = this.breakpointObserver.isMatched(Breakpoints.Handset);
      if (isSmall && this.drawer?.opened) {
        this.drawer.close();
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
