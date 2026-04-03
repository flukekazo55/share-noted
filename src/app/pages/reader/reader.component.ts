import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { Manuscript } from '../../models/document.model';

interface ContentBlock {
  type: 'text' | 'code';
  text: string;
  language?: string;
  isHtmlPreview?: boolean;
}

@Component({
  selector: 'app-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex h-[calc(100vh-64px)]">
      <!-- Left Panel: Note List -->
      <section class="w-[380px] bg-surface-container-low border-r border-outline-variant/15 flex flex-col shrink-0">
        <div class="p-6">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
            <input [(ngModel)]="searchQuery" (ngModelChange)="filterList()"
              class="w-full bg-surface-container-highest border-none rounded-md py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary-container transition-all"
              placeholder="Search manuscripts..." type="text"/>
          </div>
          <div class="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
            @for (cat of categories; track cat) {
            <button (click)="filterByCategory(cat)"
              [ngClass]="selectedCategory === cat ? 'bg-primary-container text-white' : 'bg-surface-container-high text-stone-600'"
              class="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter whitespace-nowrap">{{cat}}</button>
            }
            @if (selectedCategory) {
            <button (click)="clearCategoryFilter()" class="px-3 py-1 bg-error/10 text-error text-[10px] font-bold rounded-full uppercase tracking-tighter">Clear</button>
            }
          </div>
        </div>
        <div class="flex-1 overflow-y-auto space-y-px">
          @for (doc of filteredList; track doc.id) {
          <div (click)="selectDocument(doc.id)"
            [ngClass]="activeDocId === doc.id ? 'bg-surface-container-highest border-l-4 border-primary-container' : 'hover:bg-surface-container-high'"
            class="p-6 cursor-pointer transition-colors">
            <div class="flex justify-between items-start mb-1">
              <span class="text-[10px] font-bold uppercase text-stone-400 tracking-widest font-headline">{{doc.category.split(' / ')[0]}}</span>
              <span class="text-[10px] text-stone-400 font-headline">{{doc.dateCreated | date:'shortDate'}}</span>
            </div>
            <h3 class="text-base font-bold leading-tight mb-2" [ngClass]="activeDocId === doc.id ? 'text-primary' : 'text-stone-800'">{{doc.title}}</h3>
            <p class="text-sm text-stone-500 line-clamp-2 leading-relaxed">{{doc.content | slice:0:120}}...</p>
          </div>
          }
        </div>
      </section>

      <!-- Right Panel: Reader Area -->
      <section class="flex-1 bg-surface overflow-y-auto relative">
        @if (activeDoc) {
        <header class="sticky top-0 bg-surface/80 backdrop-blur-md px-12 py-8 flex justify-between items-end z-10">
          <div class="max-w-2xl">
            <div class="flex items-center gap-3 mb-4">
              <span [ngClass]="getStatusBadgeClass(activeDoc.status)" class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter rounded">{{activeDoc.status}}</span>
              <span class="text-stone-400 text-xs font-headline">{{activeDoc.category}}</span>
            </div>
            <h1 class="text-4xl font-extrabold text-primary font-headline tracking-tight leading-tight">{{activeDoc.title}}</h1>
          </div>
          <button (click)="editDocument()" class="flex items-center gap-2 px-6 py-2.5 border border-primary-container/20 text-primary-container rounded-md font-headline font-bold hover:bg-primary-container/5 transition-all mb-1">
            <span class="material-symbols-outlined text-base">edit</span>
            Edit Manuscript
          </button>
        </header>

        <article class="max-w-3xl mx-auto px-12 pb-24 space-y-8 mt-12">
          <div class="space-y-6 text-lg leading-relaxed text-on-surface/90">
            @for (block of contentBlocks; track $index) {
            @if (block.type === 'text') {
            <p class="whitespace-pre-wrap">{{block.text}}</p>
            } @else {
            <div class="rounded-xl border border-outline-variant/30 bg-surface-container-low overflow-hidden">
              <div class="px-4 py-2 bg-surface-container flex items-center justify-between gap-3">
                <span class="text-xs font-bold uppercase tracking-widest text-primary-container">
                  {{block.language || 'text'}}
                </span>
                <button
                  type="button"
                  (click)="copyCode(block.text, $index, $event)"
                  class="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded border border-outline-variant/30 text-primary-container hover:bg-primary-container/10 transition-colors">
                  <span class="material-symbols-outlined text-sm">{{copiedBlockIndex === $index ? 'check' : 'content_copy'}}</span>
                  {{copiedBlockIndex === $index ? 'Copied' : 'Copy'}}
                </button>
              </div>
              <pre
                (click)="copyCode(block.text, $index)"
                class="m-0 p-4 overflow-x-auto text-sm leading-relaxed text-on-surface cursor-pointer"
                title="Click to copy code"><code>{{block.text}}</code></pre>
              @if (block.isHtmlPreview) {
              <div class="border-t border-outline-variant/20 p-4 bg-surface">
                <p class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">HTML Preview</p>
                <div class="rounded-lg border border-outline-variant/30 p-3 bg-white" [innerHTML]="block.text"></div>
              </div>
              }
            </div>
            }
            }
          </div>

          <div class="pt-12 border-t border-outline-variant/20">
            <p class="text-xs text-stone-400 font-headline">Source: {{activeDoc.fileName}}</p>
          </div>
        </article>
        } @else {
        <div class="flex items-center justify-center h-full">
          <div class="text-center">
            <span class="material-symbols-outlined text-6xl text-stone-300 mb-4">article</span>
            <p class="text-stone-400 text-lg font-headline">Select a manuscript to read</p>
          </div>
        </div>
        }
      </section>
    </div>
  `
})
export class ReaderComponent implements OnInit, OnDestroy {
  documents: Manuscript[] = [];
  filteredList: Manuscript[] = [];
  activeDoc: Manuscript | undefined;
  activeDocId: number | null = null;
  searchQuery = '';
  selectedCategory = '';
  categories: string[] = [];
  contentBlocks: ContentBlock[] = [];
  copiedBlockIndex: number | null = null;
  private copyFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private docService: DocumentService
  ) {}

  ngOnInit() {
    this.documents = this.docService.getDocuments();
    this.filteredList = [...this.documents];
    const topCategories = this.docService.getCategories().map(c => c.split(' / ')[0]);
    this.categories = [...new Set(topCategories)].slice(0, 6);

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.selectDocument(id);
    }
  }

  ngOnDestroy() {
    if (this.copyFeedbackTimer) {
      clearTimeout(this.copyFeedbackTimer);
      this.copyFeedbackTimer = null;
    }
  }

  selectDocument(id: number) {
    this.activeDocId = id;
    this.activeDoc = this.docService.getDocumentById(id);
    if (this.activeDoc) {
      this.contentBlocks = this.buildContentBlocks(this.activeDoc.content);
    }
  }

  filterList() {
    let results = this.searchQuery
      ? this.docService.searchDocuments(this.searchQuery)
      : [...this.documents];
    if (this.selectedCategory) {
      results = results.filter(d => d.category.startsWith(this.selectedCategory));
    }
    this.filteredList = results;
  }

  filterByCategory(cat: string) {
    this.selectedCategory = cat;
    this.filterList();
  }

  clearCategoryFilter() {
    this.selectedCategory = '';
    this.filterList();
  }

  editDocument() {
    if (this.activeDocId) {
      this.router.navigate(['/editor', this.activeDocId]);
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Published': return 'bg-secondary-container text-secondary';
      case 'Draft': return 'bg-amber-100 text-amber-700';
      case 'Archived': return 'bg-stone-200 text-stone-600';
      default: return 'bg-stone-100 text-stone-500';
    }
  }

  async copyCode(text: string, blockIndex: number, event?: Event) {
    event?.stopPropagation();

    let copied = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied && typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      copied = document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    if (!copied) {
      return;
    }

    this.copiedBlockIndex = blockIndex;
    if (this.copyFeedbackTimer) {
      clearTimeout(this.copyFeedbackTimer);
    }
    this.copyFeedbackTimer = setTimeout(() => {
      this.copiedBlockIndex = null;
      this.copyFeedbackTimer = null;
    }, 1500);
  }

  private buildContentBlocks(content: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const fenceRegex = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = fenceRegex.exec(content)) !== null) {
      const before = content.slice(lastIndex, match.index);
      blocks.push(...this.textToBlocks(before));

      const language = (match[1] || 'text').toLowerCase();
      const code = match[2].replace(/\n+$/, '');
      const isHtmlPreview = language === 'html' || language === 'htm' || /<\s*div[\s>]/i.test(code);

      blocks.push({
        type: 'code',
        text: code,
        language,
        isHtmlPreview
      });

      lastIndex = fenceRegex.lastIndex;
    }

    const tail = content.slice(lastIndex);
    blocks.push(...this.textToBlocks(tail));

    return blocks;
  }

  private textToBlocks(text: string): ContentBlock[] {
    return text
      .split(/\n{2,}/)
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        if (/<\s*\/?\s*div[\s>]/i.test(part)) {
          return {
            type: 'code' as const,
            text: part,
            language: 'html',
            isHtmlPreview: true
          };
        }

        return {
          type: 'text' as const,
          text: part
        };
      });
  }
}
