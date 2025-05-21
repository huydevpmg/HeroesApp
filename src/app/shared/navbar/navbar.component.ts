import { Component, OnInit, TemplateRef } from '@angular/core';
import { HeroModel } from '../../hero/models/hero.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeroService } from '../../hero/service/hero.service';
import { HeroEventsService } from '../../hero/service/hero-events.service';
import { AuthService } from '../../core/services/auth.service';
import { ageValidator, emailValidator, nameValidator } from '../validators/validators';
import { Router } from '@angular/router';
import { AddHeroModalComponent } from '../../hero/component/add-hero-modal/add-hero-modal.component';
import { EditProfileModalComponent } from '../../hero/component/edit-profile-modal/edit-profile-modal.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  heroForm!: FormGroup;

  constructor(
    private heroService: HeroService,
    private fb: FormBuilder,
    private heroEvents: HeroEventsService,
    private modalService: NgbModal,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.heroForm = this.fb.group({
      name: ['', [Validators.required, nameValidator()]],
      gender: ['', Validators.required],
      email: ['', [Validators.required, emailValidator()]],
      age: ['', [Validators.required, ageValidator()]],
      address: ['', Validators.required]
    });
  }

  add(hero: HeroModel): void {
    if (this.heroForm.valid) {
      this.heroService.createHero(hero).subscribe({
        next: (newHero) => {
          this.heroEvents.notifyHeroAdded();
          this.heroForm.reset();
        },
        error: (err) => {
          console.error('Error adding hero:', err);
          alert('There was an error while adding the hero.');
        }
      });
    }
  }

  onSubmit(): void {
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      alert('User ID not found. Please login again.');
      return;
    }

    if (this.heroForm.valid) {
      const newHero: HeroModel = {
        ...this.heroForm.value,
        owner: userId
      };

      this.add(newHero);
      this.modalService.dismissAll();
    } else {
      alert('Form is invalid');
    }
  }

  openTags() {
    this.router.navigate(['/tags'])
  }

  openAddHeroModal() {
    this.modalService.open(AddHeroModalComponent, { centered: true });
  }

  openProfileModal() {
    this.modalService.open(EditProfileModalComponent, { centered: true });
  }

  logout() {
    this.authService.logout();
  }
}
