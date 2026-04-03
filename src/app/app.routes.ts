import { Routes } from '@angular/router';
import { ArchiveComponent } from './pages/archive/archive.component';
import { EditorComponent } from './pages/editor/editor.component';
import { ReaderComponent } from './pages/reader/reader.component';

export const routes: Routes = [
  { path: '', redirectTo: 'documents', pathMatch: 'full' },
  { path: 'documents', component: ArchiveComponent },
  { path: 'editor/:id', component: EditorComponent },
  { path: 'reader/:id', component: ReaderComponent },
  { path: 'reader', component: ReaderComponent },
];
