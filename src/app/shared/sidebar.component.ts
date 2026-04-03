import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DocumentService } from '../services/document.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="h-screen w-64 fixed left-0 top-0 pt-20 bg-[#efeeea] z-40 flex flex-col">
      <nav class="flex flex-col gap-2 pt-4">
        <a routerLink="/documents" routerLinkActive="text-[#004830] font-bold border-l-4 border-[#004830] bg-[#faf9f5]"
           [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' }"
           class="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-200/50 hover:translate-x-1 transition-transform duration-300">
          <span class="material-symbols-outlined">description</span>
          <span class="font-headline font-medium text-sm">All Notes</span>
        </a>
        <a routerLink="/documents" [queryParams]="{filter:'recent'}"
           routerLinkActive="text-[#004830] font-bold border-l-4 border-[#004830] bg-[#faf9f5]"
           [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' }"
           class="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-200/50 hover:translate-x-1 transition-transform duration-300">
          <span class="material-symbols-outlined">schedule</span>
          <span class="font-headline font-medium text-sm">Recent</span>
        </a>
        <a routerLink="/documents" [queryParams]="{filter:'draft'}"
           routerLinkActive="text-[#004830] font-bold border-l-4 border-[#004830] bg-[#faf9f5]"
           [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' }"
           class="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-200/50 hover:translate-x-1 transition-transform duration-300">
          <span class="material-symbols-outlined">edit_note</span>
          <span class="font-headline font-medium text-sm">Drafts</span>
        </a>
        <a routerLink="/documents" [queryParams]="{filter:'archived'}"
           routerLinkActive="text-[#004830] font-bold border-l-4 border-[#004830] bg-[#faf9f5]"
           [routerLinkActiveOptions]="{ paths: 'exact', queryParams: 'exact', matrixParams: 'ignored', fragment: 'ignored' }"
           class="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-200/50 hover:translate-x-1 transition-transform duration-300">
          <span class="material-symbols-outlined">archive</span>
          <span class="font-headline font-medium text-sm">Archived</span>
        </a>
      </nav>
      <div class="px-6 mt-auto mb-6">
        <button (click)="createNote()" class="w-full bg-primary-container text-white py-3 rounded-lg font-headline font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary transition-colors">
          <span class="material-symbols-outlined text-sm">add</span>
          New Note
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  constructor(private docService: DocumentService, private router: Router) {}

  createNote() {
    const draft = this.docService.createDocument();
    this.router.navigate(['/editor', draft.id]);
  }
}
