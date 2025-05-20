import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appOwnerBadge]'
})
export class OwnerBadgeDirective implements OnInit {
  @Input('appOwnerBadge') isOwner: boolean = false;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    if (this.isOwner) {
      const badge = this.renderer.createElement('span');
      const text = this.renderer.createText('👑 owner');

      this.renderer.appendChild(badge, text);

      this.renderer.setStyle(badge, 'position', 'absolute');
      this.renderer.setStyle(badge, 'bottom', '10px');
      this.renderer.setStyle(badge, 'right', '10px');
      this.renderer.setStyle(badge, 'background', 'rgba(0, 0, 0, 0.6)');
      this.renderer.setStyle(badge, 'color', 'white');
      this.renderer.setStyle(badge, 'padding', '4px 8px');
      this.renderer.setStyle(badge, 'border-radius', '12px');
      this.renderer.setStyle(badge, 'font-size', '0.75rem');
      this.renderer.setStyle(badge, 'z-index', '10');
      this.renderer.setStyle(badge, 'backdrop-filter', 'blur(4px)');

      this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
      this.renderer.appendChild(this.el.nativeElement, badge);
    }
  }
}
