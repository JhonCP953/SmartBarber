import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubscriptionWsService } from '../../infrastructure/subscription-ws.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-my-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.css']
})
export class MySubscriptionComponent implements OnInit, OnDestroy {
  
  subscriptionData: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  
  private wsSub?: Subscription;

  constructor(
    private router: Router,
    private subscriptionWsService: SubscriptionWsService
  ) {}

  ngOnInit(): void {
    this.loadRealSubscription();
  }

  loadRealSubscription() {
    this.isLoading = true;
    const subscriptionData$ = (this.subscriptionWsService.getSubscriptionData as unknown as () => Observable<any>)();
    this.wsSub = subscriptionData$.subscribe({
      next: (data: any) => {
        // Validación: Si el backend responde nulo o sin suscripción activa, redirigimos a planes
        if (!data || data.active === false) {
          this.router.navigate(['/subscription']);
          return;
        }
        
        this.subscriptionData = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al recibir datos de suscripción:', err);
        this.errorMessage = 'No se pudo conectar con el servidor en tiempo real.';
        this.isLoading = false;
        
     
      }
    });
  }

  ngOnDestroy(): void {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
  }

  goToPlans() {
    this.router.navigate(['/subscription']); 
  }

  renewOrManage() {
    alert('Próximamente: Módulo de pasarela de pagos.');
  }
}