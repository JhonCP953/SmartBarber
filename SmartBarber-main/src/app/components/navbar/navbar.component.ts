import { Component, Output, EventEmitter } from '@angular/core'; // <-- Se agregaron Output y EventEmitter
import { CommonModule } from '@angular/common';

interface NavLink {
  label: string;
  href: string;
  targetView?: string; // Propiedad opcional para identificar la vista
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  // Evento de salida para notificar a AppComponent el cambio de vista
  @Output() navigate = new EventEmitter<string>();

  links: NavLink[] = [
    { label: 'Inicio', href: '#inicio', targetView: 'home' },
    { label: 'Nosotros', href: '#nosotros', targetView: 'home' },
    { label: 'Servicios', href: '#servicios', targetView: 'home' },
    { label: 'Equipo', href: '#equipo', targetView: 'home' },
    { label: 'Opiniones', href: '#opiniones', targetView: 'home' },
    { label: 'Blog', href: '#blog', targetView: 'home' },
    { label: 'SUCURSALES', href: '#sucursales', targetView: 'sucursales' },
    { label: 'Contacto', href: '#reservar', targetView: 'home' }
  ];

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  // Método para manejar la navegación entre vistas
onNavClick(link: NavLink): void {
    if (link.targetView) {
      this.navigate.emit(link.targetView);
    }
    this.closeMenu();
  }
}