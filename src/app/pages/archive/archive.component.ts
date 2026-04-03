import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { Manuscript } from '../../models/document.model';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto pb-20">
      <div class="flex flex-col gap-2 mb-8">
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-extrabold text-primary tracking-tight font-headline">Support Case Library</h1>
          <span class="text-[10px] px-2 py-1 rounded-full bg-primary-container/15 text-primary-container font-bold uppercase tracking-widest">
            Read Only
          </span>
        </div>
        <p class="text-on-surface-variant font-body">
          Web can only read data. Add, update, or remove records from host text files, then run
          <code class="font-mono text-xs">npm run reimport:txt</code>.
        </p>
      </div>

      <div class="bg-surface-container-low p-4 rounded-xl mb-6 flex justify-between items-center gap-3">
        <div class="flex items-center gap-3">
          @if (activeFilterLabel) {
          <span class="text-xs px-2 py-1 rounded-full bg-secondary-container/40 text-secondary font-bold uppercase tracking-widest">
            {{activeFilterLabel}}
          </span>
          }
          <span class="text-xs text-on-surface-variant font-label uppercase tracking-widest font-bold">
            {{filteredDocuments.length}} Entries
          </span>
        </div>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input [(ngModel)]="searchQuery" (ngModelChange)="filterDocuments()"
                 class="pl-10 pr-4 py-2 bg-surface border-none rounded-lg text-sm w-72 focus:ring-1 focus:ring-primary-container transition-all"
                 placeholder="Filter by name or keyword..." type="text"/>
        </div>
      </div>

      <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container text-on-surface-variant text-xs uppercase tracking-widest font-bold font-label">
              <th class="px-6 py-4">Name</th>
              <th class="px-6 py-4">Date Created</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="font-body text-sm divide-y divide-surface-container">
            @for (doc of paginatedDocuments; track doc.id) {
            <tr class="hover:bg-surface-container-low transition-colors group">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-semibold text-primary text-base cursor-pointer hover:underline" (click)="viewDoc(doc.id)">{{doc.title}}</span>
                  <span class="text-xs text-on-surface-variant">{{doc.category}}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-on-surface-variant">{{doc.dateCreated | date:'mediumDate'}}</td>
              <td class="px-6 py-4">
                <span [ngClass]="getStatusClass(doc.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <span [ngClass]="getStatusDotClass(doc.status)" class="w-1.5 h-1.5 rounded-full mr-2"></span>
                  {{doc.status}}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  (click)="viewDoc(doc.id)"
                  class="inline-flex items-center gap-1 p-2 hover:bg-primary-container hover:text-white rounded transition-colors"
                  title="View">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                </button>
              </td>
            </tr>
            } @empty {
            <tr>
              <td colspan="4" class="px-6 py-10 text-center text-on-surface-variant text-sm">No documents found for the current filter.</td>
            </tr>
            }
          </tbody>
        </table>

        <div class="px-6 py-4 bg-surface-container-lowest flex justify-between items-center border-t border-outline-variant/10">
          <span class="text-xs text-on-surface-variant font-label uppercase tracking-widest font-bold">
            Showing {{startEntry}} to {{endEntry}} of {{filteredDocuments.length}} entries
          </span>
          <div class="flex items-center gap-1">
            <button (click)="changePage(currentPage-1)" [disabled]="currentPage===1" class="p-2 text-stone-400 hover:text-primary transition-colors disabled:opacity-50">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            @for (p of pages; track p) {
            <button (click)="changePage(p)" [ngClass]="p===currentPage ? 'bg-primary-container text-white' : 'hover:bg-stone-100'" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold">{{p}}</button>
            }
            <button (click)="changePage(currentPage+1)" [disabled]="currentPage===totalPages" class="p-2 text-stone-400 hover:text-primary transition-colors disabled:opacity-50">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArchiveComponent implements OnInit {
  documents: Manuscript[] = [];
  filteredDocuments: Manuscript[] = [];
  paginatedDocuments: Manuscript[] = [];
  searchQuery = '';
  activeFilter: 'all' | 'recent' = 'all';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pages: number[] = [];

  get startEntry(): number {
    return this.filteredDocuments.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endEntry(): number {
    return this.filteredDocuments.length === 0 ? 0 : Math.min(this.currentPage * this.pageSize, this.filteredDocuments.length);
  }

  get activeFilterLabel(): string {
    switch (this.activeFilter) {
      case 'recent': return 'Recent';
      default: return '';
    }
  }

  constructor(
    private docService: DocumentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.reloadDocuments();
    this.route.queryParamMap.subscribe(params => {
      this.activeFilter = this.resolveFilter(params.get('filter'));
      this.filterDocuments();
    });
  }

  filterDocuments(): void {
    let list = this.applyStatusFilter([...this.documents]);

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      list = list.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query)
      );
    }

    this.filteredDocuments = list;
    this.totalPages = Math.max(1, Math.ceil(this.filteredDocuments.length / this.pageSize));
    this.currentPage = 1;
    this.updatePages();
    this.paginate();
  }

  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedDocuments = this.filteredDocuments.slice(start, start + this.pageSize);
  }

  updatePages(): void {
    this.pages = this.filteredDocuments.length === 0
      ? []
      : Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
      this.paginate();
    }
  }

  viewDoc(id: number): void {
    this.router.navigate(['/reader', id]);
  }

  private reloadDocuments(): void {
    this.documents = this.docService.getDocuments();
  }

  private resolveFilter(filterValue: string | null): 'all' | 'recent' {
    switch ((filterValue || '').toLowerCase()) {
      case 'recent': return 'recent';
      default: return 'all';
    }
  }

  private applyStatusFilter(docs: Manuscript[]): Manuscript[] {
    switch (this.activeFilter) {
      case 'recent':
        return docs
          .slice()
          .sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime())
          .slice(0, 10);
      default:
        return docs;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Published': return 'bg-primary-container/10 text-primary-container';
      case 'Archived': return 'bg-stone-200 text-stone-600';
      case 'Draft': return 'bg-secondary-container text-secondary';
      default: return '';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status) {
      case 'Published': return 'bg-primary-container';
      case 'Archived': return 'bg-stone-500';
      case 'Draft': return 'bg-secondary';
      default: return '';
    }
  }
}
