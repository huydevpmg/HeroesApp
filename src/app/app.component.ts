import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'HeroesApp';
  showNavbar: boolean = true;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.url.subscribe(url => {
      this.showNavbar = !url.some(segment => segment.path === 'login');
    });
  }
}
