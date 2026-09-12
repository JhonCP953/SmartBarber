import { Component } from '@angular/core';

import { HeroComponent } from '../../components/hero/hero.component';
import { AboutComponent } from '../../components/about/about.component';
import { TeamComponent } from '../../components/team/team.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { CtaBannerComponent } from '../../components/cta-banner/cta-banner.component';
import { BlogComponent } from '../../components/blog/blog.component';

import { ServicesComponent } from '../../../services/components/services/services.component';
import { AppointmentComponent } from '../../../reservations/components/appointment/appointment.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    AboutComponent,
    ServicesComponent,
    TeamComponent,
    TestimonialsComponent,
    CtaBannerComponent,
    AppointmentComponent,
    BlogComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}