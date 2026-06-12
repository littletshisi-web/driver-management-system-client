// Centralised API route strings.
// Import from here rather than writing endpoint paths inline.

export const API = {
  // Auth
  AUTH_LOGIN:  '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME:     '/auth/me',

  // Drivers
  DRIVERS:                    '/drivers',
  DRIVER:       (id)       => `/drivers/${id}`,
  DRIVER_SUSPEND:(id)      => `/drivers/${id}/suspend`,
  DRIVER_ASSIGN: (id)      => `/drivers/${id}/assign-partner`,
  DRIVER_REMOVE: (id)      => `/drivers/${id}/remove-partner`,

  // Partners
  PARTNERS:                   '/partners',
  PARTNER:      (id)       => `/partners/${id}`,
  PARTNER_DRIVERS:(id)     => `/partners/${id}/drivers`,

  // Tasks
  TASKS:                      '/tasks',
  TASK:         (id)       => `/tasks/${id}`,
  TASK_STATUS:  (id)       => `/tasks/${id}/status`,
  TASK_ASSIGN:  (id)       => `/tasks/${id}/assign`,

  // Pricing
  PRICING_RULES:     '/pricing/rules',
  PRICING_CALCULATE: '/pricing/calculate',

  // Reports
  REPORTS_TASKS:    '/reports/tasks',
  REPORTS_EARNINGS: '/reports/earnings',
  REPORTS_EXPORT:   '/reports/export',

  // Areas
  AREAS:              '/areas',
  AREA: (id)       => `/areas/${id}`,

  // Audit
  AUDIT: '/audit',
};
