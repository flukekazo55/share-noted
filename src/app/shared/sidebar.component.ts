import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="h-screen w-64 fixed left-0 top-0 pt-20 bg-surface-container z-40 flex flex-col transition-colors">
      <nav class="flex flex-col gap-2 pt-4">
        <a routerLink="/documents" routerLinkActive="text-primary font-bold border-l-4 border-primary-container bg-surface"
           [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' }"
           class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-300">
          <span class="material-symbols-outlined">description</span>
          <span class="font-headline font-medium text-sm">All Notes</span>
        </a>
        <a routerLink="/documents" [queryParams]="{filter:'recent'}"
           routerLinkActive="text-primary font-bold border-l-4 border-primary-container bg-surface"
           [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' }"
           class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:translate-x-1 transition-transform duration-300">
          <span class="material-symbols-outlined">schedule</span>
          <span class="font-headline font-medium text-sm">Recent</span>
        </a>
      </nav>
    </aside>
  `
})
export class SidebarComponent {}
