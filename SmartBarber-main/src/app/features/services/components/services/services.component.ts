import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Service {
  title: string;
  description: string;
  icon: 'calendar' | 'users' | 'catalog' | 'chart';
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {

  services: Service[] = [
    {
      icon: 'calendar',
      title: 'Gestión de Citas',
      description: 'Agenda digital interactiva para organizar los turnos de tu barbería y evitar cruces de horarios.'
    },
    {
      icon: 'users',
      title: 'Control de Equipos',
      description: 'Administra tus barberos, asignación de sillones, horarios de trabajo y cálculo de comisiones.'
    },
    {
      icon: 'catalog',
      title: 'Catálogo de Servicios',
      description: 'Personaliza tu menú de cortes, precios, duraciones estimadas y ofertas especiales para tus clientes.'
    },
    {
      icon: 'chart',
      title: 'Métricas de Negocio',
      description: 'Reportes en tiempo real sobre ingresos, flujo de clientes y rendimiento diario de tus barberos.'
    }
  ];

}