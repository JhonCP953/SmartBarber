import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SubscriptionHeroComponent } from '../subscription-hero/subscription-hero.component';
import { SubscriptionInfoComponent } from '../subscription-info/subscription-info.component';
import { SubscriptionPlansComponent } from '../subscription-plans/subscription-plans.component';
import { SubscriptionFAQComponent } from '../subscription-faq/subscription-faq.component';
import { ChangeDetectionStrategy ,Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    SubscriptionHeroComponent, 
    SubscriptionInfoComponent, 
    SubscriptionPlansComponent,
    SubscriptionFAQComponent,
  ],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent {}