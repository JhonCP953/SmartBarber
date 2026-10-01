import {
    UserRole,
    UserStatus
} from '../../../../core/auth/model/auth-session.model';

export type PanelNavigationItemStatus =
    | 'AVAILABLE'
    | 'COMING_SOON';

export interface PanelNavigationItem {
    id: string;
    label: string;
    description: string;
    icon: string;
    route: string;
    roles: UserRole[];
    status: PanelNavigationItemStatus;
    visible: boolean;
}

export interface PanelNavigationGroup {
    id: string;
    label: string;
    items: PanelNavigationItem[];
    roles: UserRole[];
}

export interface PanelSummary {
    title: string;
    subtitle: string;
    roleLabel: string;
    statusLabel: string;
    userName: string;
    email: string;
    barbershopName: string | null;
    tenantId: string | null;
    userId: string;
    clientId: string | null;
    barberId: string | null;
    barbershopId: string | null;
}