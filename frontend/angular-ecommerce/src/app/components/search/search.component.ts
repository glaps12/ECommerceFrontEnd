import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  constructor(private router: Router) {}

  doSearch(input: string): void {
    const q = (input ?? '').trim();
    if (!q) {
      return;
    }
    this.router.navigateByUrl(`/search/${encodeURIComponent(q)}`);
  }
}