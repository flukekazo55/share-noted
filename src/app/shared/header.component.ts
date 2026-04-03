import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  template: `
    <header
      class="w-full sticky top-0 z-50 bg-surface flex justify-between items-center px-8 h-16 border-b border-outline-variant/10 transition-colors"
    >
      <div class="flex items-center gap-8">
        <span class="text-xl font-bold tracking-tighter text-primary">
          Support Case
        </span>
      </div>
    </header>
  `,
})
export class HeaderComponent {}
