import type { Permission } from './rbac'

export type AdminNavIcon =
  | 'dashboard'
  | 'orders'
  | 'menu'
  | 'categories'
  | 'reservations'
  | 'tables'
  | 'customers'
  | 'reviews'
  | 'analytics'
  | 'reports'
  | 'coupons'
  | 'marketing'
  | 'staff'
  | 'cms'
  | 'gallery'
  | 'settings'

export type NavItem = {
  href: string
  label: string
  icon: AdminNavIcon
  permission: Permission | null
}

export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Service',
    items: [
      { href: '/admin', label: 'Overview', icon: 'dashboard', permission: null },
      { href: '/admin/orders', label: 'Orders', icon: 'orders', permission: 'orders.view' },
      { href: '/admin/reservations', label: 'Reservations', icon: 'reservations', permission: 'reservations.view' },
      { href: '/admin/tables', label: 'Tables', icon: 'tables', permission: 'tables.manage' },
    ],
  },
  {
    group: 'Kitchen',
    items: [
      { href: '/admin/menu', label: 'Menu', icon: 'menu', permission: 'menu.view' },
      { href: '/admin/categories', label: 'Categories', icon: 'categories', permission: 'menu.manage' },
    ],
  },
  {
    group: 'Guests',
    items: [
      { href: '/admin/customers', label: 'Customers', icon: 'customers', permission: 'customers.view' },
      { href: '/admin/reviews', label: 'Reviews', icon: 'reviews', permission: 'reviews.moderate' },
    ],
  },
  {
    group: 'Growth',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: 'analytics', permission: 'analytics.view' },
      { href: '/admin/reports', label: 'Reports', icon: 'reports', permission: 'reports.view' },
      { href: '/admin/coupons', label: 'Coupons', icon: 'coupons', permission: 'coupons.manage' },
      { href: '/admin/marketing', label: 'Marketing', icon: 'marketing', permission: 'marketing.manage' },
    ],
  },
  {
    group: 'Manage',
    items: [
      { href: '/admin/content', label: 'Content', icon: 'cms', permission: 'cms.manage' },
      { href: '/admin/gallery', label: 'Gallery', icon: 'gallery', permission: 'cms.manage' },
      { href: '/admin/staff', label: 'Staff', icon: 'staff', permission: 'staff.manage' },
      { href: '/admin/settings', label: 'Settings', icon: 'settings', permission: 'settings.manage' },
    ],
  },
]
