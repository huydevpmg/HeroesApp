import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SocketService } from './chat/services/socket/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HeroesApp';
  showNavbar: boolean = true;

  constructor(
    private router: Router,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    // Track navigation events
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showNavbar = !event.url.includes('/login');

        if (event.url.includes('/chat')) {
          this.socketService.connect();
        }
      });

    this.socketService.connect();
  }

  ngOnDestroy() {
    // Disconnect socket when app closes
    this.socketService.disconnect();
  }
}
