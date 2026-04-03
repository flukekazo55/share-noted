export interface Manuscript {
  id: number;
  title: string;
  category: string;
  content: string;
  dateCreated: Date;
  status: 'Published' | 'Archived' | 'Draft';
  fileName: string;
}
