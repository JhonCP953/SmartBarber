import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionPlansComponent {}
