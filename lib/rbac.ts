/**
 * Role-based access control.
 *
 * This module is intentionally dependency-free so it can be imported by both
 * server code (authorisation checks) and client components (hiding UI). The
 * client usage is cosmetic only — every privileged action re-checks the
 * permission on the server.
 */

export const ROLES = [
  'CUSTOMER',
  'SUPER_ADMIN',
  'MANAGER',
  'WAITER',
  'KITCHEN_STAFF',
  'MARKETING',
  'CASHIER',
] as const

export type Role = (typeof ROLES)[number]

export const STAFF_ROLES: Role[] = [
  'SUPER_ADMIN',
  'MANAGER',
  'WAITER',
  'KITCHEN_STAFF',
  'MARKETING',
  'CASHIER',
]

export const PERMISSIONS = [
  'orders.view',
  'orders.update',
  'orders.cancel',
  'orders.refund',
  'menu.view',
  'menu.manage',
  'reservations.view',
  'reservations.manage',
  'tables.manage',
  'customers.view',
  'reviews.moderate',
  'analytics.view',
  'reports.view',
  'coupons.manage',
  'marketing.manage',
  'staff.manage',
  'cms.manage',
  'settings.manage',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CUSTOMER: [],

  SUPER_ADMIN: [...PERMISSIONS],

  MANAGER: [
    'orders.view',
    'orders.update',
    'orders.cancel',
    'orders.refund',
    'menu.view',
    'menu.manage',
    'reservations.view',
    'reservations.manage',
    'tables.manage',
    'customers.view',
    'reviews.moderate',
    'analytics.view',
    'reports.view',
    'coupons.manage',
    'cms.manage',
  ],

  WAITER: [
    'orders.view',
    'orders.update',
    'reservations.view',
    'reservations.manage',
    'tables.manage',
    'customers.view',
    'menu.view',
  ],

  KITCHEN_STAFF: ['orders.view', 'orders.update', 'menu.view'],

  CASHIER: ['orders.view', 'orders.update', 'orders.refund', 'customers.view', 'menu.view'],

  MARKETING: [
    'coupons.manage',
    'marketing.manage',
    'reviews.moderate',
    'analytics.view',
    'customers.view',
    'cms.manage',
  ],
}

export function isStaffRole(role: string | null | undefined): role is Role {
  return !!role && STAFF_ROLES.includes(role as Role)
}

export function permissionsFor(role: string | null | undefined): Permission[] {
  if (!role) return []
  return ROLE_PERMISSIONS[role as Role] ?? []
}

export function can(role: string | null | undefined, permission: Permission): boolean {
  return permissionsFor(role).includes(permission)
}

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: 'Customer',
  SUPER_ADMIN: 'Super Admin',
  MANAGER: 'Manager',
  WAITER: 'Waiter',
  KITCHEN_STAFF: 'Kitchen Staff',
  MARKETING: 'Marketing',
  CASHIER: 'Cashier',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  CUSTOMER: 'Standard guest account with access to the customer portal only.',
  SUPER_ADMIN: 'Full access to every area of the platform.',
  MANAGER: 'Runs day-to-day service: orders, menu, reservations, customers and reports.',
  WAITER: 'Front of house: reservations, table status and customer lookup.',
  KITCHEN_STAFF: 'Kitchen display: incoming orders and cooking status.',
  MARKETING: 'Offers, coupons, campaigns and review responses.',
  CASHIER: 'Billing: orders, payment status and receipts.',
}
