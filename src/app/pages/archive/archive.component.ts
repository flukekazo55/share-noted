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
      <!-- Header Section -->
      <div class="flex flex-col gap-1 mb-8">
        <h1 class="text-3xl font-extrabold text-primary tracking-tight font-headline">Archive Management</h1>
        <p class="text-on-surface-variant font-body">Manage and restore TCC support case records and technical manuscripts.</p>
      </div>

      <!-- Bulk Actions & Filters -->
      <div class="bg-surface-container-low p-4 rounded-xl mb-6 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 bg-surface p-1 rounded-lg border border-outline-variant/15">
            <span class="material-symbols-outlined text-primary-container ml-2">inventory_2</span>
            <select [(ngModel)]="bulkAction" class="bg-transparent border-none focus:ring-0 text-sm font-label font-semibold pr-8 text-primary-container">
              <option value="">Bulk Actions</option>
              <option value="delete">Delete Selected</option>
              <option value="archive">Archive Selected</option>
              <option value="restore">Restore Selected</option>
            </select>
          </div>
          <button
            (click)="applyBulkAction()"
            [disabled]="!bulkAction || selectedCount === 0"
            class="px-3 py-2 rounded-lg text-xs uppercase tracking-widest font-bold bg-primary-container text-white disabled:opacity-40 disabled:cursor-not-allowed">
            Apply
          </button>
          <div class="h-6 w-px bg-outline-variant/30"></div>
          <span class="text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold">{{selectedCount}} Items Selected</span>
          @if (activeFilterLabel) {
          <span class="text-xs px-2 py-1 rounded-full bg-secondary-container/40 text-secondary font-bold uppercase tracking-widest">
            {{activeFilterLabel}}
          </span>
          }
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input [(ngModel)]="searchQuery" (ngModelChange)="filterDocuments()"
                   class="pl-10 pr-4 py-2 bg-surface border-none rounded-lg text-sm w-64 focus:ring-1 focus:ring-primary-container transition-all"
                   placeholder="Filter by name or keyword..." type="text"/>
          </div>
        </div>
      </div>

      <!-- Data Grid / Table -->
      <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-container text-on-surface-variant text-xs uppercase tracking-widest font-bold font-label">
              <th class="px-6 py-4 w-12">
                <input
                  [checked]="allPageSelected"
                  (change)="toggleSelectAll($event)"
                  class="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                  type="checkbox"/>
              </th>
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
                <input [checked]="selectedIds.has(doc.id)" (change)="toggleSelect(doc.id)" class="rounded border-outline-variant text-primary-container focus:ring-primary-container" type="checkbox"/>
              </td>
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
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="viewDoc(doc.id)" class="p-2 hover:bg-primary-container hover:text-white rounded transition-colors" title="View"><span class="material-symbols-outlined text-sm">visibility</span></button>
                  <button (click)="editDoc(doc.id)" class="p-2 hover:bg-primary-container hover:text-white rounded transition-colors" title="Edit"><span class="material-symbols-outlined text-sm">edit</span></button>
                  <button (click)="archiveDocument(doc.id)" class="p-2 hover:bg-amber-600 hover:text-white rounded transition-colors" title="Archive"><span class="material-symbols-outlined text-sm">archive</span></button>
                  <button (click)="deleteDocument(doc.id)" class="p-2 hover:bg-error hover:text-white rounded transition-colors" title="Delete"><span class="material-symbols-outlined text-sm">delete</span></button>
                </div>
              </td>
            </tr>
            } @empty {
            <tr>
              <td colspan="5" class="px-6 py-10 text-center text-on-surface-variant text-sm">No documents found for the current filter.</td>
            </tr>
            }
          </tbody>
        </table>

        <!-- Pagination -->
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
  selectedIds = new Set<number>();
  searchQuery = '';
  activeFilter: 'all' | 'recent' | 'draft' | 'archived' = 'all';
  bulkAction: '' | 'delete' | 'archive' | 'restore' = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pages: number[] = [];
  Math = Math;

  get selectedCount(): number { return this.selectedIds.size; }
  get allPageSelected(): boolean {
    return this.paginatedDocuments.length > 0 && this.paginatedDocuments.every(doc => this.selectedIds.has(doc.id));
  }
  get startEntry(): number {
    return this.filteredDocuments.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }
  get endEntry(): number {
    return this.filteredDocuments.length === 0 ? 0 : Math.min(this.currentPage * this.pageSize, this.filteredDocuments.length);
  }
  get activeFilterLabel(): string {
    switch (this.activeFilter) {
      case 'recent': return 'Recent';
      case 'draft': return 'Drafts';
      case 'archived': return 'Archived';
      default: return '';
    }
  }

  constructor(
    private docService: DocumentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.reloadDocuments();
    this.route.queryParamMap.subscribe(params => {
      this.activeFilter = this.resolveFilter(params.get('filter'));
      this.filterDocuments();
    });
  }

  filterDocuments() {
    let list = [...this.documents];
    list = this.applyStatusFilter(list);

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
    this.selectedIds.clear();
    this.updatePages();
    this.paginate();
  }

  paginate() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedDocuments = this.filteredDocuments.slice(start, start + this.pageSize);
  }

  updatePages() {
    this.pages = this.filteredDocuments.length === 0
      ? []
      : Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.currentPage = p;
      this.paginate();
    }
  }

  toggleSelect(id: number) {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
  }

  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    for (const doc of this.paginatedDocuments) {
      if (checked) {
        this.selectedIds.add(doc.id);
      } else {
        this.selectedIds.delete(doc.id);
      }
    }
  }

  applyBulkAction() {
    if (!this.bulkAction || this.selectedCount === 0) { return; }

    const selected = Array.from(this.selectedIds);
    switch (this.bulkAction) {
      case 'delete':
        this.docService.deleteDocuments(selected);
        break;
      case 'archive':
        this.docService.updateDocumentsStatus(selected, 'Archived');
        break;
      case 'restore':
        this.docService.updateDocumentsStatus(selected, 'Published');
        break;
    }

    this.reloadDocuments();
    this.bulkAction = '';
    this.filterDocuments();
  }

  archiveDocument(id: number) {
    this.docService.updateDocumentsStatus([id], 'Archived');
    this.reloadDocuments();
    this.filterDocuments();
  }

  deleteDocument(id: number) {
    this.docService.deleteDocument(id);
    this.reloadDocuments();
    this.filterDocuments();
  }

  viewDoc(id: number) { this.router.navigate(['/reader', id]); }
  editDoc(id: number) { this.router.navigate(['/editor', id]); }

  private reloadDocuments() {
    this.documents = [...this.docService.getDocuments()];
  }

  private resolveFilter(filterValue: string | null): 'all' | 'recent' | 'draft' | 'archived' {
    switch ((filterValue || '').toLowerCase()) {
      case 'recent': return 'recent';
      case 'draft': return 'draft';
      case 'archived': return 'archived';
      default: return 'all';
    }
  }

  private applyStatusFilter(docs: Manuscript[]): Manuscript[] {
    switch (this.activeFilter) {
      case 'draft':
        return docs.filter(doc => doc.status === 'Draft');
      case 'archived':
        return docs.filter(doc => doc.status === 'Archived');
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
