// ======================== Role Constants ========================

export interface RoleOption {
    value: string
    code: string
    name: string
    scope: 'GLOBAL' | 'FRANCHISE'
}

export const ROLES: RoleOption[] = [
    {
        value: '698eab0726ca2b18eb35336c',
        code: 'ADMIN',
        name: 'Admin',
        scope: 'GLOBAL',
    },
    {
        value: '698eab0726ca2b18eb35336f',
        code: 'MANAGER',
        name: 'Manager',
        scope: 'FRANCHISE',
    },
    {
        value: '698eab0726ca2b18eb353372',
        code: 'STAFF',
        name: 'Staff',
        scope: 'FRANCHISE',
    },
    {
        value: '698eab0726ca2b18eb353375',
        code: 'SHIPPER',
        name: 'Shipper',
        scope: 'FRANCHISE',
    },
    {
        value: '698eab0826ca2b18eb353378',
        code: 'USER',
        name: 'User',
        scope: 'FRANCHISE',
    },
]
