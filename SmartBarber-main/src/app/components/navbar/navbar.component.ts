import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavSubLink {
  label: string;
  href: string;
  targetView: string;
}

interface NavLink {
  label: string;
  href: string;
  targetView?: string;
  sublinks?: NavSubLink[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Output() navigate = new EventEmitter<string>();

  links: NavLink[] = [
    { label: 'Inicio', href: '#inicio', targetView: 'home' },
    { label: 'Nosotros', href: '#nosotros', targetView: 'home' },
    { label: 'Servicios', href: '#servicios', targetView: 'home' },
    { label: 'Equipo', href: '#equipo', targetView: 'home' },
    { label: 'Opiniones', href: '#opiniones', targetView: 'home' },
    { label: 'Blog', href: '#blog', targetView: 'home' },
    { label: 'SUCURSALES', href: '#sucursales', targetView: 'sucursales' },
    { 
      label: 'Contacto', 
      href: '#reservar', 
      targetView: 'home',
      sublinks: [
        { label: 'Contacto directo', href: '#reservar', targetView: 'home' },
        { label: 'Suscripción / Planes', href: '#suscripcion', targetView: 'suscripcion' }
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

  onNavClick(link: { targetView?: string; [key: string]: any }): void {
    if (link && link.targetView) {
      this.navigate.emit(link.targetView);
    }
    this.closeMenu();
  }
}