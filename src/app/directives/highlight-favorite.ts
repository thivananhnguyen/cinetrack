import { Directive, input, ElementRef, effect, inject } from '@angular/core';

@Directive({ selector: '[appHighlightFavorite]' })
export class HighlightFavorite {
  appHighlightFavorite = input.required<'favorite' | 'recommended' | 'none'>();
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect(() => {
      const type = this.appHighlightFavorite();
      const style = this.el.nativeElement.style;

      switch (type) {
        case 'favorite':
          style.borderColor = '#f59e0b';
          style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.15)';
          break;
        case 'recommended':
          style.borderColor = '#3b82f6';
          style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.15)';
          break;
        default:
          style.borderColor = '';
          style.boxShadow = '';
      }
    });
  }
}
