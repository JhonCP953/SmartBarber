export type UserRole =
    | 'CLIENT'
    | 'BARBER'
    | 'ADMIN';

export const USER_ROLE_IDS = {

    CLIENT: 3,

    BARBER: 2,

    ADMIN: 1

} as const;

export type UserRoleId =
    typeof USER_ROLE_IDS[
    keyof typeof USER_ROLE_IDS
    ];