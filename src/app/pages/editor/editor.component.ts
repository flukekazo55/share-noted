import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { Manuscript } from '../../models/document.model';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (document) {
    <!-- Editor Toolbar -->
    <div class="sticky top-16 z-40 bg-surface-container-low/80 backdrop-blur-md px-8 py-3 flex items-center justify-between">
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-1 pr-4 border-r border-outline-variant/30">
          <button class="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors" title="Bold">
            <span class="material-symbols-outlined">format_bold</span>
          </button>
          <button class="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors" title="Italic">
            <span class="material-symbols-outlined">format_italic</span>
          </button>
          <button class="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors" title="Underline">
            <span class="material-symbols-outlined">format_underlined</span>
          </button>
        </div>
        <div class="flex items-center gap-1 px-4 border-r border-outline-variant/30">
          <button class="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors">
            <span class="material-symbols-outlined">format_list_bulleted</span>
          </button>
          <button class="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors">
            <span class="material-symbols-outlined">format_list_numbered</span>
          </button>
        </div>
        <div class="flex items-center gap-1 pl-4">
          <button class="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors">
            <span class="material-symbols-outlined">link</span>
          </button>
          <button class="p-2 hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors">
            <span class="material-symbols-outlined">format_quote</span>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button (click)="goBack()" class="px-5 py-2 text-sm font-medium text-stone-500 hover:text-error transition-colors">Discard</button>
        <button (click)="save()" class="px-6 py-2 bg-primary-container text-on-primary rounded-md text-sm font-bold editorial-shadow hover:bg-primary transition-all">Save Changes</button>
      </div>
    </div>

    <div class="flex">
      <!-- Focused Editor View -->
      <div class="max-w-[800px] mx-auto pt-16 pb-32 px-8 flex-1">
        <!-- Metadata Badge -->
        <div class="mb-8">
          <span class="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container/30 text-secondary font-label text-[10px] uppercase tracking-widest font-bold rounded-full">
            <span class="w-1.5 h-1.5 bg-secondary rounded-full"></span>
            {{document.category}} • {{document.status}}
          </span>
        </div>

        <!-- Note Title Input -->
        <textarea [(ngModel)]="document.title"
          class="w-full bg-transparent border-none focus:ring-0 font-headline font-extrabold text-5xl text-primary placeholder:text-surface-variant resize-none leading-tight tracking-tight mb-8"
          placeholder="Enter Manuscript Title..."
          rows="2"></textarea>

        <!-- Editor Body -->
        <div class="space-y-6">
          <textarea [(ngModel)]="document.content"
            class="w-full bg-transparent border-none focus:ring-0 font-body text-xl leading-relaxed text-on-surface-variant placeholder:text-surface-variant/50 resize-none min-h-[614px]"
            placeholder="Start typing your editorial thoughts..."></textarea>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="w-64 hidden xl:block shrink-0 pt-16 pr-8">
        <div class="bg-surface-container-low p-6 rounded-xl space-y-6 editorial-shadow sticky top-32">
          <div>
            <h4 class="font-headline text-xs font-bold uppercase tracking-widest text-primary mb-3">Manuscript Info</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-stone-500">Category</span>
                <span class="text-on-surface font-medium">{{document.category}}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-stone-500">Words</span>
                <span class="text-on-surface font-medium">{{wordCount}}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-stone-500">Status</span>
                <span class="text-on-surface font-medium">{{document.status}}</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-stone-500">Created</span>
                <span class="text-on-surface font-medium">{{document.dateCreated | date:'mediumDate'}}</span>
              </div>
            </div>
          </div>
          <div class="pt-4 border-t border-outline-variant/20">
            <h4 class="font-headline text-xs font-bold uppercase tracking-widest text-primary mb-3">Source File</h4>
            <p class="text-xs text-stone-500 break-all">{{document.fileName}}</p>
          </div>
        </div>
      </div>
    </div>
    } @else {
    <div class="flex items-center justify-center h-96">
      <p class="text-stone-400 text-lg">Document not found.</p>
    </div>
    }
  `
})
export class EditorComponent implements OnInit {
  document: Manuscript | undefined;

  get wordCount(): number {
    return this.document?.content.split(/\s+/).filter(w => w.length > 0).length || 0;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private docService: DocumentService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.document = this.docService.getDocumentById(id);
  }

  save() {
    if (this.document) {
      this.docService.updateDocument(this.document.id, {
        title: this.document.title,
        content: this.document.content
      });
      this.router.navigate(['/reader', this.document.id]);
    }
  }

  goBack() {
    this.router.navigate(['/documents']);
  }
}
