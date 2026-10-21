import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-subscription-status',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './subscription-status.component.html',
  styleUrl: './subscription-status.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionStatusComponent {}
