src/
├── app/
│   ├── core/                          # Services và modules cốt lõi 
│   │   ├── interceptors/
│   │   ├── guards/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── hero.service.ts
│   │   │   └── user.service.ts
│   │   ├── models/
│   │   │   ├── hero.model.ts
│   │   │   ├── user.model.ts
│   │   │   └── tag.model.ts
│   │   ├── core.module.ts
│   │   └── jwt.interceptor.ts
│
│   ├── shared/                        # Components, directives, pipes dùng chung
│   │   ├── components/
│   │   │   ├── hero-card/
│   │   │   └── form-error/
│   │   ├── pipes/
│   │   │   └── capitalize.pipe.ts
│   │   ├── validators/
│   │   │   └── email.validator.ts
│   │   └── shared.module.ts
│
│   ├── auth/                          # Module đăng nhập, đăng ký
│   │   ├── login/
│   │   ├── register/
│   │   ├── auth-routing.module.ts
│   │   └── auth.module.ts
│
│   ├── heroes/                        # Hero CRUD
│   │   ├── components/
│   │   │   ├── hero-form/
│   │   │   ├── hero-list/
│   │   │   └── hero-details/
│   │   ├── store/                     # ngRx
│   │   │   ├── hero.actions.ts
│   │   │   ├── hero.reducer.ts
│   │   │   ├── hero.effects.ts
│   │   │   └── hero.selectors.ts
│   │   ├── heroes-routing.module.ts
│   │   └── heroes.module.ts
│
│   ├── profile/                       # Profile
│   │   ├── profile.component.ts
│   │   └── profile.module.ts
│
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   └── app.module.ts
│
├── assets/
│   └── ...
├── environments/
│   └── environment.ts
│   └── environment.prod.ts
└── main.ts
