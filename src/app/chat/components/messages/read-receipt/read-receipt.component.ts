import { Component, Input, AfterViewInit, ElementRef, OnChanges, SimpleChanges, OnInit } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-read-receipt',
  templateUrl: './read-receipt.component.html',
  styleUrls: ['./read-receipt.component.css']
})
export class ReadReceiptComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() users: any[] = [];

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    // Component initialized
  }

  ngAfterViewInit(): void {
    this.initTooltips();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users']) {
      setTimeout(() => this.initTooltips(), 0);
    }
  }

  private initTooltips() {
    const tooltipElements = this.elementRef.nativeElement.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipElements.forEach((element: any) => new bootstrap.Tooltip(element));
  }
}
