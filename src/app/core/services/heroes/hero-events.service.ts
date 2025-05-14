import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class HeroEventsService {
  private heroAddedSubject = new Subject<void>();
  heroAdded$ = this.heroAddedSubject.asObservable();

  notifyHeroAdded() {
    this.heroAddedSubject.next();
  }
}
