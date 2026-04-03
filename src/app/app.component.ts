import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header.component';
import { SidebarComponent } from './shared/sidebar.component';
import { FooterComponent } from './shared/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <app-sidebar></app-sidebar>
    <main class="ml-64 pt-6 px-12 min-h-screen">
      <router-outlet></router-outlet>
    </main>
    <div class="ml-64">
      <app-footer></app-footer>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'manuscript-library';
}
