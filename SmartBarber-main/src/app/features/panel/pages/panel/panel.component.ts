import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';

import { Subscription } from 'rxjs';

import { SessionService } from '../../../../core/auth/services/session.service';
import { LogoutService } from '../../../../core/auth/services/logout.service';

import {
  PanelNavigationGroup,
  PanelNavigationItem,
  PanelSummary
} from '../../domain/models/panel-navigation.model';

import { PanelNavigationService } from '../../application/services/panel-navigation.service';


@Component({
  selector: 'app-panel',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet
  ],

  templateUrl: './panel.component.html',

  styleUrl: './panel.component.css'
})
export class PanelComponent
  implements OnInit, OnDestroy {


  private readonly sessionService =
    inject(SessionService);


  private readonly logoutService =
    inject(LogoutService);


  private readonly navigationService =
    inject(PanelNavigationService);


  private readonly router =
    inject(Router);


  private sessionSubscription?: Subscription;


  readonly navigationGroups =
    signal<PanelNavigationGroup[]>([]);


  readonly mobileMenuOpen =
    signal(false);


  readonly sidebarCollapsed =
    signal(false);


  readonly userMenuOpen =
    signal(false);


  readonly logoutLoading =
    signal(false);


  readonly selectedComingSoon =
    signal<PanelNavigationItem | null>(null);


  readonly summary =
    signal<PanelSummary | null>(null);


  ngOnInit(): void {

    this.loadPanel();

    this.sessionSubscription =
      this.sessionService.session$.subscribe(() => {

        this.loadPanel();

      });
  }


  ngOnDestroy(): void {

    this.sessionSubscription?.unsubscribe();

  }


  @HostListener('document:click')
  onDocumentClick(): void {

    this.userMenuOpen.set(false);

  }


  private loadPanel(): void {

    const session =
      this.sessionService.currentSession;


    if (!session) {

      this.navigationGroups.set([]);

      this.summary.set(null);

      return;
    }


    this.navigationGroups.set(
      this.navigationService.getNavigation()
    );


    this.summary.set({

      title:
        this.getWelcomeTitle(
          session.displayName
        ),

      subtitle:
        this.getWelcomeSubtitle(
          session.role
        ),

      roleLabel:
        this.getRoleLabel(
          session.role
        ),

      statusLabel:
        this.getStatusLabel(
          session.status
        ),

      userName:
        session.displayName || 'Usuario',

      email:
        session.email,

      barbershopName:
        null,

      tenantId:
        session.tenantId,

      userId:
        session.userId,

      clientId:
        session.clientId,

      barberId:
        session.barberId,

      barbershopId:
        session.barbershopId
    });
  }

  get currentModule(): PanelNavigationItem | null {

    if (this.isPanelHome()) {
      return null;
    }

    const currentUrl =
      this.router.url.split('?')[0];

    return (
      this.navigationGroups()
        .flatMap(group => group.items)
        .find(item =>
          currentUrl === item.route ||
          currentUrl.startsWith(
            `${item.route}/`
          )
        ) ?? null
    );
  }


  get currentModuleTitle(): string {

    if (this.isPanelHome()) {
      return 'PANEL DE CONTROL';
    }

    return (
      this.currentModule?.label.toUpperCase() ??
      'SMARTBARBER'
    );
  }


  get currentModuleSubtitle(): string {

    if (this.isPanelHome()) {

      return (
        this.summary()?.subtitle ??
        'Bienvenido a SmartBarber.'
      );
    }

    return (
      this.currentModule?.description ??
      'Gestiona tu información desde SmartBarber.'
    );
  }


  get availableItemCount(): number {

    return this.navigationGroups()

      .flatMap(
        group => group.items
      )

      .filter(
        item =>
          item.status === 'AVAILABLE'
      )

      .length;
  }


  get comingSoonItemCount(): number {

    return this.navigationGroups()

      .flatMap(
        group => group.items
      )

      .filter(
        item =>
          item.status === 'COMING_SOON'
      )

      .length;
  }


  toggleSidebar(): void {

    this.sidebarCollapsed.update(
      value => !value
    );
  }


  toggleMobileMenu(): void {

    this.mobileMenuOpen.update(
      value => !value
    );
  }


  closeMobileMenu(): void {

    this.mobileMenuOpen.set(false);
  }


  toggleUserMenu(): void {

    this.userMenuOpen.update(
      value => !value
    );
  }


  closeUserMenu(): void {

    this.userMenuOpen.set(false);
  }


  navigateToItem(
    item: PanelNavigationItem
  ): void {

    if (
      item.status === 'COMING_SOON'
    ) {

      this.selectedComingSoon.set(item);

      return;
    }


    this.closeMobileMenu();

    this.closeUserMenu();


    void this.router.navigateByUrl(
      item.route
    );
  }


  closeComingSoon(): void {

    this.selectedComingSoon.set(null);
  }


  async logout(): Promise<void> {

    if (this.logoutLoading()) {

      return;
    }


    this.logoutLoading.set(true);

    this.closeUserMenu();


    try {

      await this.logoutService.execute();

    } finally {

      this.logoutLoading.set(false);

    }
  }


  isCurrentRoute(
    route: string
  ): boolean {

    if (
      route === '/panel/home' ||
      route === '/panel'
    ) {

      return (

        this.router.url === '/panel/home' ||

        this.router.url === '/panel' ||

        this.router.url.startsWith(
          '/panel/home?'
        )

      );
    }


    return (

      this.router.url === route ||

      this.router.url.startsWith(
        `${route}/`
      )

    );
  }


  isPanelHome(): boolean {

    return (

      this.router.url === '/panel/home' ||

      this.router.url === '/panel'

    );
  }


  getRoleLabel(
    role:
      'CLIENT' |
      'ADMIN' |
      'BARBER'
  ): string {

    switch (role) {

      case 'ADMIN':
        return 'Administrador';

      case 'BARBER':
        return 'Barbero';

      case 'CLIENT':
        return 'Cliente';

      default:
        return 'Usuario';
    }
  }


  getStatusLabel(
    status:
      'ACTIVE' |
      'BLOCKED' |
      'INACTIVE'
  ): string {

    switch (status) {

      case 'ACTIVE':
        return 'Cuenta activa';

      case 'BLOCKED':
        return 'Cuenta bloqueada';

      case 'INACTIVE':
        return 'Cuenta inactiva';

      default:
        return 'Estado no disponible';
    }
  }


  getInitials(
    name: string
  ): string {

    if (!name.trim()) {

      return 'U';
    }


    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (parts.length === 1) {

      return parts[0]
        .charAt(0)
        .toUpperCase();
    }


    return (

      parts[0].charAt(0) +

      parts[parts.length - 1].charAt(0)

    ).toUpperCase();
  }


  getWelcomeTitle(
    name: string
  ): string {

    return `Bienvenido, ${name || 'a SmartBarber'
      }`;
  }


  getWelcomeSubtitle(
    role:
      'CLIENT' |
      'ADMIN' |
      'BARBER'
  ): string {

    switch (role) {

      case 'ADMIN':
        return 'Gestiona tu barbería desde un solo lugar.';

      case 'BARBER':
        return 'Consulta tu agenda y organiza tu jornada.';

      case 'CLIENT':
        return 'Administra tus reservas y disfruta tu experiencia.';

      default:
        return 'Bienvenido a SmartBarber.';
    }
  }


  getIconPath(
    icon: string
  ): string {

    const paths:
      Record<string, string> = {


      home:
        'M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5v-9ZM9 21v-6h6v6',


      profile:
        'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',


      calendar:
        'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z',


      queue:
        'M5 6h14M5 12h14M5 18h14',


      history:
        'M4 12a8 8 0 1 0 2.3-5.6M4 5v5h5M12 8v4l3 2',


      bell:
        'M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4',


      users:
        'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7a4 4 0 0 1 0 7.7M22 21v-2a4 4 0 0 0-3-3.87',


      scissors:
        'M6 4a3 3 0 1 0 0 6 3 3 0 0 0-0-6Zm0 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm3-5 11 9M9 15 20 6',


      clock:
        'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',


      wallet:
        'M4 6h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7a1 1 0 0 1 1-1h16M16 13h5',


      chart:
        'M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3M20 16V6'
    };


    return paths[icon] ?? paths['home'];
  }
}