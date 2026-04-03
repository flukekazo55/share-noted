import { Injectable } from '@angular/core';
import { importedDocuments } from '../data/imported-documents';
import { Manuscript } from '../models/document.model';

interface StoredManuscript extends Omit<Manuscript, 'dateCreated'> {
  dateCreated: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly localDbKey = 'share-noted.documents.v2';
  private documents: Manuscript[] = [];

  constructor() {
    this.loadFromLocalDb();
  }

  getDocuments(): Manuscript[] {
    return this.documents;
  }

  getDocumentById(id: number): Manuscript | undefined {
    return this.documents.find(d => d.id === id);
  }

  searchDocuments(query: string): Manuscript[] {
    const q = query.toLowerCase();
    return this.documents.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q)
    );
  }

  getDocumentsByStatus(status: string): Manuscript[] {
    return this.documents.filter(d => d.status === status);
  }

  getCategories(): string[] {
    return [...new Set(this.documents.map(d => d.category))];
  }

  updateDocument(id: number, updates: Partial<Manuscript>): void {
    const idx = this.documents.findIndex(d => d.id === id);
    if (idx >= 0) {
      this.documents[idx] = { ...this.documents[idx], ...updates };
      this.persistToLocalDb();
    }
  }

  createDocument(
    initial?: Partial<Pick<Manuscript, 'title' | 'category' | 'content' | 'status' | 'fileName'>>
  ): Manuscript {
    const nextId = this.documents.reduce((max, doc) => Math.max(max, doc.id), 0) + 1;
    const newDoc: Manuscript = {
      id: nextId,
      title: initial?.title?.trim() || 'Untitled Manuscript',
      category: initial?.category?.trim() || 'Draft / Notes',
      content: initial?.content ?? '',
      dateCreated: new Date(),
      status: initial?.status ?? 'Draft',
      fileName: initial?.fileName?.trim() || `draft-${nextId}.txt`
    };

    this.documents.unshift(newDoc);
    this.persistToLocalDb();
    return newDoc;
  }

  updateDocumentsStatus(ids: number[], status: Manuscript['status']): void {
    const idSet = new Set(ids);
    this.documents = this.documents.map(doc =>
      idSet.has(doc.id) ? { ...doc, status } : doc
    );
    this.persistToLocalDb();
  }

  deleteDocument(id: number): void {
    this.deleteDocuments([id]);
  }

  deleteDocuments(ids: number[]): void {
    const idSet = new Set(ids);
    this.documents = this.documents.filter(doc => !idSet.has(doc.id));
    this.persistToLocalDb();
  }

  clearDocuments(): void {
    this.documents = [];
    this.persistToLocalDb();
  }

  resetFromImportedFiles(): void {
    this.documents = importedDocuments.map(doc => ({
      ...doc,
      dateCreated: new Date(doc.dateCreated)
    }));
    this.persistToLocalDb();
  }

  private loadFromLocalDb(): void {
    if (!this.canUseLocalDb()) {
      this.documents = importedDocuments.map(doc => ({
        ...doc,
        dateCreated: new Date(doc.dateCreated)
      }));
      return;
    }

    const raw = localStorage.getItem(this.localDbKey);
    if (!raw) {
      this.resetFromImportedFiles();
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredManuscript[];
      if (!Array.isArray(parsed)) {
        this.resetFromImportedFiles();
        return;
      }

      this.documents = parsed.map(doc => ({
        ...doc,
        dateCreated: new Date(doc.dateCreated)
      }));
    } catch {
      this.resetFromImportedFiles();
    }
  }

  private persistToLocalDb(): void {
    if (!this.canUseLocalDb()) {
      return;
    }

    const payload: StoredManuscript[] = this.documents.map(doc => ({
      ...doc,
      dateCreated: doc.dateCreated.toISOString()
    }));

    localStorage.setItem(this.localDbKey, JSON.stringify(payload));
  }

  private canUseLocalDb(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
