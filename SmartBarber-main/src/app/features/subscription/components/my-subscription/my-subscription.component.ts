import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-subscription.component.html',
  styleUrls: ['./my-subscription.component.css']
})
export class MySubscriptionComponent implements OnInit {
  
  // Objeto simulado o que luego vendrá de tu servicio backend/WebSocket
  subscriptionData: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // AQUÍ CONECTARÁS EL SERVICIO CUANDO TU COMPAÑERO TERMINE EL BACKEND
    // Ejemplo de prueba temporal para ver cómo luce el diseño:
    this.loadMockSubscription();
  }

  loadMockSubscription() {
    // Simulamos que ya trajo los datos de la BD
    this.subscriptionData = {
      nombre: 'PLAN PREMIUM',
      descripcion: 'Plan premium para barberías con funciones avanzadas y equipo.',
      precio: 45000,
      barberShopName: 'SmartBarber Studio Principal'
    };
  }

  goToPlans() {
    this.router.navigate(['/subscription']); // O la ruta donde tengas tus tarjetas de planes
  }

  renewOrManage() {
    alert('Próximamente: Módulo de pasarela de pagos y facturación por Gmail.');
  }
}