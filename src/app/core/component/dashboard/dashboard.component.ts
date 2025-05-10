import { Component, inject, OnInit, signal, TemplateRef, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeroModel } from '../../models/hero.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeroService } from '../../services/heroes/hero.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  heroes: HeroModel[] = [];
  heroForm!: FormGroup;
  private modalService = inject(NgbModal);

  constructor(private heroService: HeroService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.heroForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(1)]],
      address: ['', Validators.required]
    });

    this.getHeroes();
  }
  add(hero: HeroModel): void {
    if (this.heroForm.valid) {
      hero.id = this.heroes.length + 1;

      this.heroService.addHero(hero);
      this.heroes.push(hero);
      this.heroForm.reset();
    }
  }

  onSubmit(): void {
    if (this.heroForm.valid) {
      const newHero: HeroModel = this.heroForm.value;
      this.add(newHero);
      this.heroForm.reset();
    }

  }

  getHeroes(): void {
    this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes.slice(1, 5));
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

}
