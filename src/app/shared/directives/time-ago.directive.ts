import { Directive, ElementRef, Input, OnChanges } from '@angular/core';
import { formatDistanceToNowStrict } from 'date-fns';

@Directive({
  selector: '[appTimeAgo]',
})
export class TimeAgoDirective implements OnChanges {
  @Input('appTimeAgo') date!: string | Date;

  constructor(private el: ElementRef) {}

  ngOnChanges(): void {
    if (this.date) {
      this.el.nativeElement.innerText = this.getShortTimeAgo(
        new Date(this.date)
      );
    }
  }

  private getShortTimeAgo(date: Date): string {
    if (isNaN(date.getTime())) {
      return '';
    }

    const [value, unit] = formatDistanceToNowStrict(date).split(' ');

    const shortUnit =
      {
        second: 's',
        seconds: 's',
        minute: 'm',
        minutes: 'm',
        hour: 'h',
        hours: 'h',
        day: 'd',
        days: 'd',
        month: 'mo',
        months: 'mo',
        year: 'y',
        years: 'y',
      }[unit] || '';

    return `${value}${shortUnit}`;
  }
}
