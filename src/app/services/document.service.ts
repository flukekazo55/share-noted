import { Injectable } from '@angular/core';
import { importedDocuments } from '../data/imported-documents';
import { Manuscript } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly documents: Manuscript[];

  constructor() {
    this.documents = importedDocuments.map(doc => ({
      ...doc,
      dateCreated: new Date(doc.dateCreated)
    }));
  }

  getDocuments(): Manuscript[] {
    return this.documents.map(doc => ({
      ...doc,
      dateCreated: new Date(doc.dateCreated)
    }));
  }

  getDocumentById(id: number): Manuscript | undefined {
    const doc = this.documents.find(d => d.id === id);
    if (!doc) {
      return undefined;
    }

    return {
      ...doc,
      dateCreated: new Date(doc.dateCreated)
    };
  }

  searchDocuments(query: string): Manuscript[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.getDocuments();
    }

    return this.documents.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q)
    ).map(doc => ({
      ...doc,
      dateCreated: new Date(doc.dateCreated)
    }));
  }

  getDocumentsByStatus(status: Manuscript['status']): Manuscript[] {
    return this.documents
      .filter(d => d.status === status)
      .map(doc => ({
        ...doc,
        dateCreated: new Date(doc.dateCreated)
      }));
  }

  getCategories(): string[] {
    return [...new Set(this.documents.map(d => d.category))];
  }
}
