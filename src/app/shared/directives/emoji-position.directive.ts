import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appEmojiPosition]'
})
export class EmojiPositionDirective {
  @HostBinding('class.emoji-picker-top') isTop = false;
  @HostBinding('class.emoji-picker-bottom') isBottom = true;

  constructor(private el: ElementRef) { }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  ngAfterViewInit() {
    this.updatePosition();
  }

  updatePosition() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (rect.top > viewportHeight / 2) {
      this.isTop = true;
      this.isBottom = false;
    } else {
      this.isTop = false;
      this.isBottom = true;
    }
  }
}
