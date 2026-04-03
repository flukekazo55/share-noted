import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="w-full border-t border-outline-variant/20 py-6 bg-surface flex justify-between items-center px-8 transition-colors">
      <span class="font-body text-xs text-on-surface-variant">(c) 2024 Digital Manuscript. Confidential.</span>
      <div class="flex gap-6">
        <a class="font-body text-xs text-on-surface-variant hover:text-primary transition-opacity" href="#">Privacy Policy</a>
        <a class="font-body text-xs text-on-surface-variant hover:text-primary transition-opacity" href="#">Terms of Service</a>
        <a class="font-body text-xs text-on-surface-variant hover:text-primary transition-opacity" href="#">Support</a>
      </div>
    </footer>
  `
})
export class FooterComponent {}
