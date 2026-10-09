export type UserRole =
    | 'CLIENT'
    | 'BARBER'
    | 'ADMIN';

export const USER_ROLE_IDS = {

    CLIENT: 1,

    BARBER: 2,

    ADMIN: 4

} as const;

export type UserRoleId =
    typeof USER_ROLE_IDS[
    keyof typeof USER_ROLE_IDS
    ];