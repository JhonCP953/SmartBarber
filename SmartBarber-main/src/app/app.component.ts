import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { ServicesComponent } from './components/services/services.component';
import { TeamComponent } from './components/team/team.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { BranchRegisterComponent } from './components/branch-register/branch-register.component';
import { CtaBannerComponent } from './components/cta-banner/cta-banner.component';
import { AppointmentComponent } from './components/appointment/appointment.component';
import { BlogComponent } from './components/blog/blog.component';
import { FooterComponent } from './components/footer/footer.component';

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
  // 'home' o 'sucursales'
  currentView: string = 'home';

  setView(view: string): void {
    this.currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}