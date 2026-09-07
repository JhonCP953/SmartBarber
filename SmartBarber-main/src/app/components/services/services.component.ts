import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Service {
  title: string;
  description: string;
  icon: 'scissors' | 'razor' | 'shave' | 'mask';
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  @Output() navigateToSubscription = new EventEmitter<string>();

  services: Service[] = [
    {
      icon: 'scissors',
      title: 'Estilos de corte',
      description: 'Cortes clásicos y modernos adaptados a la forma de tu rostro y tipo de cabello.'
    },
    {
      icon: 'razor',
      title: 'Arreglo de barba',
      description: 'Perfilado con navaja, toallas calientes y aceites para hidratar y dar forma.'
    },
    {
      icon: 'shave',
      title: 'Afeitado suave',
      description: 'Afeitado tradicional a navaja con toallas calientes para un acabado impecable.'
    },
    {
      icon: 'mask',
      title: 'Mascarilla facial',
      description: 'Limpieza profunda y mascarilla para dejar la piel del rostro fresca y renovada.'
    }
  ];

  onViewPlans(): void {
    this.navigateToSubscription.emit('suscripcion');
  }
}