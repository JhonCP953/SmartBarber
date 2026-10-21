import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-subscription',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MySubscriptionComponent {}
