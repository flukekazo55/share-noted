import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="w-full border-t border-stone-200/20 py-6 bg-[#faf9f5] flex justify-between items-center px-8">
      <span class="font-body text-xs text-stone-500">© 2024 ThaiBev Digital Manuscript. Confidential.</span>
      <div class="flex gap-6">
        <a class="font-body text-xs text-stone-500 hover:text-[#004830] transition-opacity" href="#">Privacy Policy</a>
        <a class="font-body text-xs text-stone-500 hover:text-[#004830] transition-opacity" href="#">Terms of Service</a>
        <a class="font-body text-xs text-stone-500 hover:text-[#004830] transition-opacity" href="#">Support</a>
      </div>
    </footer>
  `
})
export class FooterComponent {}
