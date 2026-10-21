import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-subscription-module',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subscription-module.component.html',
  styleUrl: './subscription-module.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionModuleComponent {
  readonly module = inject(ActivatedRoute).snapshot.data as {
    title: string;
    description: string;
    availability: string;
  };
}
