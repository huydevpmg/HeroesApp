import { HeroService } from '../../heroes/hero.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HeroModel } from '../../models/hero.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
  hero: HeroModel | undefined;
  isEditing: boolean = false;
  heroForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.heroForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: [0, [Validators.required, Validators.min(1)]],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.getHero();
  }

  getHero(): void {
    const _id = this.route.snapshot.paramMap.get('id');
    if (_id) {
      this.heroService.getHeroById(_id).subscribe(hero => {
        this.hero = hero;
        this.heroForm.patchValue({
          name: hero.name,
          gender: hero.gender,
          email: hero.email,
          age: hero.age,
          address: hero.address
        });
      });
    }
  }

  enableEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  saveChanges(): void {
    if (this.hero && this.heroForm.valid) {
      const updatedHero: HeroModel = {
        ...this.hero,
        ...this.heroForm.value
      };
      this.heroService.updateHero(this.hero._id, updatedHero).subscribe(() => {
        this.hero = updatedHero;
        this.isEditing = false;
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
