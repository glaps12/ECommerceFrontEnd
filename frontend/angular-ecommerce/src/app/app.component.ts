import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild, inject, afterNextRender, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { filter, map, shareReplay, startWith } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { TranslateService } from '@ngx-translate/core';

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
  private readonly cartService = inject(CartService);
  readonly translate = inject(TranslateService);

  isBrowser = false;
  currentLang = 'tr';

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

  readonly isFullWidthPage$ = this.router.events.pipe(
    filter((e) => e instanceof NavigationEnd),
    map((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      return url.includes('/login') || url.includes('/settings') || url.includes('/checkout');
    }),
    startWith(false),
    shareReplay(1),
  );

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    // i18n setup
    this.translate.addLangs(['tr', 'en']);
    this.translate.setDefaultLang('tr');

    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('brookyshop-lang');
      this.currentLang = savedLang || 'tr';
    }
    this.translate.use(this.currentLang);

    afterNextRender(() => {
      this.isBrowser = true;
      this.themeService.initThemeFromStorage();

      // Load cart from server if user is logged in
      const email = this.authService.userEmail$.value;
      if (email) {
        this.cartService.loadCartFromServer(email);
      }
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

  switchLanguage(): void {
    this.currentLang = this.currentLang === 'tr' ? 'en' : 'tr';
    this.translate.use(this.currentLang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('brookyshop-lang', this.currentLang);
    }
  }

  logout(): void {
    this.cartService.clearSync();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
