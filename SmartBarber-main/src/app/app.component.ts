import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Shared
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

// Features - Landing Page
import { HeroComponent } from './features/landing/components/hero/hero.component';
import { AboutComponent } from './features/landing/components/about/about.component';
import { TeamComponent } from './features/landing/components/team/team.component';
import { TestimonialsComponent } from './features/landing/components/testimonials/testimonials.component';
import { CtaBannerComponent } from './features/landing/components/cta-banner/cta-banner.component';
import { BlogComponent } from './features/landing/components/blog/blog.component';

// Features - Servicios y Tarifas
import { ServicesComponent } from './features/services/components/services/services.component';
import { PricingComponent } from './features/services/components/pricing/pricing.component';

// Features - Suscripciones y Membresías
import { SubscriptionComponent } from './features/subscription/components/subscription/subscription.component';

// Features - Gestión de Sucursales
import { BranchRegisterComponent } from './features/barber-shop/components/branch-register/branch-register.component';

// Features - Agenda de Citas
import { AppointmentComponent } from './features/reservations/components/appointment/appointment.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    AboutComponent,
    ServicesComponent,
    TeamComponent,
    PricingComponent,
    SubscriptionComponent,
    TestimonialsComponent,
    BranchRegisterComponent,
    CtaBannerComponent,
    AppointmentComponent,
    BlogComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  currentView: string = 'home';

  setView(view: string): void {
    this.currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}