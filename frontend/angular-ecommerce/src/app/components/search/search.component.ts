import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {

  constructor(private router : Router) { }


doSearch(input: string) {

  this.router.navigateByUrl(`/search/${input}`);
  

}

}
