import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavSubLink {
  label: string;
  route: string;
  fragment?: string;
}

interface NavLink {
  label: string;
  route: string;
  fragment?: string;
  sublinks?: NavSubLink[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  links: NavLink[] = [
    {
      label: 'Inicio',
      route: '/',
      fragment: 'inicio'
    },
    {
      label: 'Nosotros',
      route: '/',
      fragment: 'nosotros'
    },
    {
      label: 'Servicios',
      route: '/',
      fragment: 'servicios'
    },
    {
      label: 'Equipo',
      route: '/',
      fragment: 'equipo'
    },
    {
      label: 'Opiniones',
      route: '/',
      fragment: 'opiniones'
    },
    {
      label: 'Blog',
      route: '/',
      fragment: 'blog'
    },
    {
      label: 'Contacto',
      route: '/',
      fragment: 'reservar',
      sublinks: [
        {
          label: 'Suscripción / Planes',
          route: '/subscription'
        }
      ]
    }
  ];

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}