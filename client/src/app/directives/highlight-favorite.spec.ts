import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightFavorite } from './highlight-favorite';

@Component({
  imports: [HighlightFavorite],
  template: '<div appHighlightFavorite="favorite"></div>',
})
class HostComponent {}

describe('HighlightFavorite', () => {
  it('should apply favorite styles', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('div') as HTMLDivElement;
    expect(element.style.borderColor).not.toBe('');
  });
});
