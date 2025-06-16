import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { formatDistanceToNow } from 'date-fns'; // Thư viện date-fns

@Directive({
  selector: '[appTimeAgo]'
})
export class TimeAgoDirective implements OnChanges {

  @Input('appTimeAgo') date!: string | Date;

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date']) {
      const formattedTime = this.getTimeAgo(this.date);
      this.el.nativeElement.innerText = formattedTime;
    }
  }

  private getTimeAgo(date: string | Date): string {
    const inputDate = new Date(date);

    const distance = formatDistanceToNow(inputDate, { addSuffix: false });
    return this.formatShortDistance(distance);
  }

  private formatShortDistance(distance: string): string {
    const unitsMap: Record<string, string> = {
      seconds: 's',
      minutes: 'm',
      hours: 'hrs',
      days: 'd',
      weeks: 'w',
      months: 'mo',
      years: 'y'
    };

    let formattedDistance = distance;

    Object.entries(unitsMap).forEach(([word, shortUnit]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      formattedDistance = formattedDistance.replace(regex, shortUnit);
    });

    formattedDistance = formattedDistance.replace(/about|in/g, '').trim();

    return formattedDistance;
  }
}
