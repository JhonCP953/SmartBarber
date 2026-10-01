import { Injectable, inject } from '@angular/core';

import { SessionService } from '../../../../core/auth/services/session.service';
import {
    PanelNavigationGroup,
    PanelNavigationItem
} from '../../domain/models/panel-navigation.model';

@Injectable()
export class PanelNavigationService {

    private readonly sessionService = inject(SessionService);

    private readonly navigationGroups: PanelNavigationGroup[] = [

        // ============================================================
        // GENERAL
        // ============================================================

        {
            id: 'general',
            label: 'General',
            roles: ['CLIENT', 'BARBER', 'ADMIN'],
            items: [
                {
                    id: 'dashboard',
                    label: 'Inicio',
                    description: 'Resumen de tu actividad en SmartBarber.',
                    icon: '⌂',
                    route: '/panel',
                    roles: ['CLIENT', 'BARBER', 'ADMIN'],
                    status: 'AVAILABLE',
                    visible: true
                },
                {
                    id: 'profile',
                    label: 'Mi perfil',
                    description: 'Consulta y administra tu información personal.',
                    icon: '◎',
                    route: '/profile',
                    roles: ['CLIENT', 'BARBER', 'ADMIN'],
                    status: 'AVAILABLE',
                    visible: true
                }
            ]
        },

        // ============================================================
        // CLIENTE
        // ============================================================

        {
            id: 'client',
            label: 'Mi experiencia',
            roles: ['CLIENT'],
            items: [
                {
                    id: 'reservations',
                    label: 'Mis reservas',
                    description: 'Consulta y gestiona tus reservas.',
                    icon: '▣',
                    route: '/reservar',
                    roles: ['CLIENT'],
                    status: 'AVAILABLE',
                    visible: true
                },
                {
                    id: 'virtual-queue',
                    label: 'Cola virtual',
                    description: 'Consulta turnos disponibles y tiempos aproximados.',
                    icon: '≡',
                    route: '/panel/virtual-queue',
                    roles: ['CLIENT'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'reservation-history',
                    label: 'Historial',
                    description: 'Consulta tus reservas y servicios anteriores.',
                    icon: '◷',
                    route: '/panel/history',
                    roles: ['CLIENT'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'notifications',
                    label: 'Notificaciones',
                    description: 'Consulta avisos relacionados con tus reservas.',
                    icon: '◇',
                    route: '/panel/notifications',
                    roles: ['CLIENT'],
                    status: 'COMING_SOON',
                    visible: true
                }
            ]
        },

        // ============================================================
        // BARBERO
        // ============================================================

        {
            id: 'barber',
            label: 'Operación',
            roles: ['BARBER'],
            items: [
                {
                    id: 'barber-agenda',
                    label: 'Mi agenda',
                    description: 'Consulta las reservas asignadas a tu agenda.',
                    icon: '▣',
                    route: '/panel/agenda',
                    roles: ['BARBER'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'barber-queue',
                    label: 'Cola virtual',
                    description: 'Administra la atención de clientes en espera.',
                    icon: '≡',
                    route: '/panel/virtual-queue',
                    roles: ['BARBER'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'barber-clients',
                    label: 'Clientes',
                    description: 'Consulta la información relacionada con tus clientes.',
                    icon: '◉',
                    route: '/panel/clients',
                    roles: ['BARBER'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'barber-availability',
                    label: 'Disponibilidad',
                    description: 'Administra tu disponibilidad y novedades.',
                    icon: '◌',
                    route: '/panel/availability',
                    roles: ['BARBER'],
                    status: 'COMING_SOON',
                    visible: true
                }
            ]
        },

        // ============================================================
        // ADMINISTRADOR
        // ============================================================

        {
            id: 'administration',
            label: 'Administración',
            roles: ['ADMIN'],
            items: [
                {
                    id: 'barbershop',
                    label: 'Mi barbería',
                    description: 'Administra la información principal de la barbería.',
                    icon: '⌂',
                    route: '/panel/barbershop',
                    roles: ['ADMIN'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'barbers',
                    label: 'Barberos',
                    description: 'Gestiona los barberos asociados a la barbería.',
                    icon: '◉',
                    route: '/panel/barbers',
                    roles: ['ADMIN'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'clients',
                    label: 'Clientes',
                    description: 'Consulta y administra los clientes de la barbería.',
                    icon: '◎',
                    route: '/panel/clients',
                    roles: ['ADMIN'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'users',
                    label: 'Usuarios',
                    description: 'Consulta el estado y gestiona el acceso de los usuarios.',
                    icon: '◎',
                    route: '/panel/users',
                    roles: ['ADMIN'],
                    status: 'AVAILABLE',
                    visible: true
                },
                {
                    id: 'services',
                    label: 'Servicios',
                    description: 'Gestiona los servicios ofrecidos por la barbería.',
                    icon: '✦',
                    route: '/panel/services',
                    roles: ['ADMIN'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'schedule',
                    label: 'Horarios',
                    description: 'Configura horarios, descansos, vacaciones y novedades.',
                    icon: '◷',
                    route: '/panel/schedule',
                    roles: ['ADMIN'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'reservations',
                    label: 'Reservas',
                    description: 'Administra las reservas realizadas en la barbería.',
                    icon: '▣',
                    route: '/panel/reservations',
                    roles: ['ADMIN'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'virtual-queue',
                    label: 'Cola virtual',
                    description: 'Administra los turnos y espacios disponibles.',
                    icon: '≡',
                    route: '/panel/virtual-queue',
                    roles: ['ADMIN'],
                    status: 'COMING_SOON',
                    visible: true
                },
                {
                    id: 'analytics',
                    label: 'Métricas',
                    description: 'Consulta indicadores y comportamiento de la operación.',
                    icon: '▥',
                    route: '/panel/analytics',
                    roles: ['ADMIN'],
                    status: 'COMING_SOON',
                    visible: true
                }
            ]
        },

        // ============================================================
        // SUSCRIPCIÓN
        // ============================================================

        {
            id: 'subscription',
            label: 'Cuenta',
            roles: ['ADMIN'],
            items: [
                {
                    id: 'subscription-management',
                    label: 'Suscripción',
                    description: 'Consulta el estado y la información de la suscripción.',
                    icon: '◇',
                    route: '/subscription',
                    roles: ['ADMIN'],
                    status: 'AVAILABLE',
                    visible: true
                }
            ]
        }
    ];

    getNavigation(): PanelNavigationGroup[] {
        const session = this.sessionService.currentSession;

        if (!session) {
            return [];
        }

        return this.navigationGroups
            .filter(group => group.roles.includes(session.role))
            .map(group => ({
                ...group,
                items: group.items.filter(
                    item =>
                        item.visible &&
                        item.roles.includes(session.role)
                )
            }))
            .filter(group => group.items.length > 0);
    }

    getAvailableItems(): PanelNavigationItem[] {
        return this.getNavigation()
            .flatMap(group => group.items)
            .filter(item => item.status === 'AVAILABLE');
    }

    getComingSoonItems(): PanelNavigationItem[] {
        return this.getNavigation()
            .flatMap(group => group.items)
            .filter(item => item.status === 'COMING_SOON');
    }
}