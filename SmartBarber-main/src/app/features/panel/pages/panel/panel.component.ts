import {
    Component,
    OnDestroy,
    OnInit,
    inject,
    signal
} from '@angular/core';

import {
    CommonModule
} from '@angular/common';

import {
    Router,
    RouterLink,
    RouterOutlet
} from '@angular/router';

import {
    Subscription
} from 'rxjs';

import {
    SessionService
} from '../../../../core/auth/services/session.service';

import {
    LogoutService
} from '../../../../core/auth/services/logout.service';

import {
    PanelNavigationGroup,
    PanelNavigationItem,
    PanelSummary
} from '../../domain/models/panel-navigation.model';

import {
    PanelNavigationService
} from '../../application/services/panel-navigation.service';


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


    private sessionSubscription?:
        Subscription;


    readonly navigationGroups =
        signal<PanelNavigationGroup[]>(
            []
        );


    readonly mobileMenuOpen =
        signal(false);


    readonly sidebarCollapsed =
        signal(false);


    readonly logoutLoading =
        signal(false);


    readonly selectedComingSoon =
        signal<PanelNavigationItem | null>(
            null
        );


    readonly summary =
        signal<PanelSummary | null>(
            null
        );


    ngOnInit(): void {

        this.loadPanel();


        this.sessionSubscription =
            this.sessionService.session$
                .subscribe(() => {

                    this.loadPanel();

                });
    }


    ngOnDestroy(): void {

        this.sessionSubscription
            ?.unsubscribe();
    }


    private loadPanel(): void {

        const session =
            this.sessionService.currentSession;


        if (!session) {

            this.navigationGroups.set(
                []
            );

            this.summary.set(
                null
            );

            return;
        }


        this.navigationGroups.set(
            this.navigationService
                .getNavigation()
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
                session.displayName ||
                'Usuario',

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

        this.mobileMenuOpen.set(
            false
        );
    }


    navigateToItem(
        item: PanelNavigationItem
    ): void {

        if (
            item.status ===
            'COMING_SOON'
        ) {

            this.selectedComingSoon.set(
                item
            );

            return;
        }


        this.closeMobileMenu();


        void this.router.navigateByUrl(
            item.route
        );
    }


    closeComingSoon(): void {

        this.selectedComingSoon.set(
            null
        );
    }


    async logout(): Promise<void> {

        if (
            this.logoutLoading()
        ) {
            return;
        }


        this.logoutLoading.set(
            true
        );


        try {

            await this.logoutService.execute();

        } finally {

            this.logoutLoading.set(
                false
            );
        }
    }


    isCurrentRoute(
        route: string
    ): boolean {

        return (
            this.router.url ===
            route
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

            return 'SB';
        }


        const names =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (
            names.length === 1
        ) {

            return names[0]
                .substring(0, 2)
                .toUpperCase();
        }


        return (
            names[0].charAt(0) +
            names[names.length - 1]
                .charAt(0)
        ).toUpperCase();
    }


    get availableItemCount(): number {

        return this.navigationService
            .getAvailableItems()
            .length;
    }


    get comingSoonItemCount(): number {

        return this.navigationService
            .getComingSoonItems()
            .length;
    }


    private getWelcomeTitle(
        displayName: string
    ): string {

        const firstName =
            displayName
                ?.trim()
                .split(/\s+/)[0] ||
            'Usuario';


        return `Bienvenido, ${firstName}`;
    }


    private getWelcomeSubtitle(
        role:
            'CLIENT' |
            'ADMIN' |
            'BARBER'
    ): string {

        switch (role) {

            case 'ADMIN':
                return 'Administra y supervisa la operación de tu barbería.';

            case 'BARBER':
                return 'Consulta tu agenda y gestiona tu jornada de trabajo.';

            case 'CLIENT':
                return 'Consulta tus reservas y disfruta de tu experiencia en SmartBarber.';

            default:
                return 'Gestiona tu experiencia en SmartBarber.';
        }
    }
}