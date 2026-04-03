import { Routes } from '@angular/router';
import { ArchiveComponent } from './pages/archive/archive.component';
import { ReaderComponent } from './pages/reader/reader.component';

export const routes: Routes = [
  { path: '', redirectTo: 'documents', pathMatch: 'full' },
  { path: 'documents', component: ArchiveComponent },
  { path: 'reader/:id', component: ReaderComponent },
  { path: 'reader', component: ReaderComponent },
  { path: '**', redirectTo: 'documents' }
];
