import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Permission string format: "Page Name_accessType"
// Example: "Admin panel_read", "Dashboard_write"

/**
 * Parse page permissions from roles array
 * @param {string[]} rolesArray - Array of permission strings like ["Page Name_read", "Page Name_write"]
 * @returns {Object} - Object mapping page names to access types, e.g., { "Page Name": ["read", "write"] }
 */
const parsePagePermissions = (rolesArray) => {
  if (!Array.isArray(rolesArray) || rolesArray.length === 0) {
    return {};
  }

  const pagePermissions = {};

  rolesArray.forEach((permission) => {
    if (typeof permission !== 'string') return;

    // Split by last underscore to handle page names with underscores
    const lastUnderscoreIndex = permission.lastIndexOf('_');
    if (lastUnderscoreIndex === -1) return;

    const pageName = permission.substring(0, lastUnderscoreIndex).trim();
    const accessType = permission.substring(lastUnderscoreIndex + 1).trim().toLowerCase();

    if (!pageName || !accessType) return;

    // Normalize page names (handle typos like "Dashboad" → "Dashboard")
    const normalizedPageName = normalizePageName(pageName);

    if (!pagePermissions[normalizedPageName]) {
      pagePermissions[normalizedPageName] = [];
    }

    if (!pagePermissions[normalizedPageName].includes(accessType)) {
      pagePermissions[normalizedPageName].push(accessType);
    }
  });

  return pagePermissions;
};

/**
 * Normalize page names to handle typos and case variations
 * @param {string} pageName - Original page name
 * @returns {string} - Normalized page name
 */
const normalizePageName = (pageName) => {
  const normalized = pageName.trim();
  
  // Handle common typos
  const typoMap = {
    'Dashboad': 'Dashboard',
    'Admin Panel': 'Admin panel',
    'AdminPanel': 'Admin panel',
  };

  return typoMap[normalized] || normalized;
};

/**
 * Map related pages to a canonical page name for permission checks.
 * This lets a single permission like "Evaluation Matrix_read"
 * automatically grant access to its child pages such as
 * "Evaluation Breakdown" and "Evaluation Recommendation".
 *
 * @param {string} pageName - Original page name
 * @returns {string} - Canonical page name used for comparisons
 */
const getCanonicalPageName = (pageName) => {
  const normalized = normalizePageName(pageName);

  // Group Evaluation pages: parent + children use same canonical name
  const evaluationGroup = [
    'Evaluation Matrix',
    'Evaluation Breakdown',
    'Evaluation Recommendation',
  ];

  if (evaluationGroup.includes(normalized)) {
    return 'Evaluation Matrix';
  }

  return normalized;
};

/**
 * Check if user has access to a page with specific access type
 * @param {string[]} rolesArray - Array of permission strings from user.piref_role[0].roles
 * @param {string} pageName - Page name to check
 * @param {string} accessType - Access type: 'read', 'write', 'update', 'delete'
 * @returns {boolean}
 */
const hasPermissionInRoles = (rolesArray, pageName, accessType) => {
  if (!Array.isArray(rolesArray)) return false;

  const canonicalPageName = getCanonicalPageName(pageName);
  const normalizedAccessType = accessType.toLowerCase();

  // Check for exact match first
  const exactMatch = rolesArray.some((permission) => {
    if (typeof permission !== 'string') return false;
    const lastUnderscoreIndex = permission.lastIndexOf('_');
    if (lastUnderscoreIndex === -1) return false;
    
    const permPageName = getCanonicalPageName(
      permission.substring(0, lastUnderscoreIndex).trim()
    );
    const permAccessType = permission
      .substring(lastUnderscoreIndex + 1)
      .trim()
      .toLowerCase();
    
    return (
      permPageName.toLowerCase() === canonicalPageName.toLowerCase() &&
      permAccessType === normalizedAccessType
    );
  });

  return exactMatch;
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      permissions: [],
      pagePermissions: {},

      /**
       * Login with credentials
       * @param {Object} credentials - { username, password }
       * @param {Function} validateUser - Function to validate credentials (from adminStore)
       */
      login: async (credentials, validateUser) => {
        const { username, password } = credentials;

        console.log('🔐 AuthStore login called:', { username, passwordLength: password?.length });

        if (!username || !password) {
          throw new Error('Username and password are required');
        }

        // Validate credentials using adminStore function (already includes hardcoded admin)
        const user = validateUser(username, password);

        if (!user) {
          console.log('❌ AuthStore: User validation failed');
          throw new Error('Invalid credentials');
        }

        console.log('✅ AuthStore: User validated:', { id: user.id, username: user.username, email: user.email });

        // Extract permissions from piref_role for non-super-admin users.
        // Super admin ('admin' / 'admin@123') will bypass permission checks in hasPageAccess.
        let permissions = [];
        let pagePermissions = {};

        if (user.piref_role && Array.isArray(user.piref_role) && user.piref_role.length > 0) {
          const roleData = user.piref_role[0];
          if (roleData.roles && Array.isArray(roleData.roles)) {
            permissions = roleData.roles;
            pagePermissions = parsePagePermissions(roleData.roles);
            console.log('✅ AuthStore: Permissions parsed:', { 
              permissionCount: permissions.length,
              pageCount: Object.keys(pagePermissions).length 
            });
          }
        }

        // Store user without password but preserve piref_role
        const { password: _, ...userWithoutPassword } = user;

        set({
          user: {
            ...userWithoutPassword,
            piref_role: user.piref_role, // Preserve for permission checks
          },
          isAuthenticated: true,
          permissions,
          pagePermissions,
        });

        console.log('✅ AuthStore: Login successful, user stored');
      },

      /**
       * Check if user has access to a page
       * @param {string} pageName - Page name to check
       * @param {string} accessType - Access type: 'read', 'write', 'update', 'delete' (default: 'read')
       * @returns {boolean}
       */
      hasPageAccess: (pageName, accessType = 'read') => {
        const { user, pagePermissions, isAuthenticated } = get();

        // Super Admin: hardcoded "admin" user has full access to all pages,
        // regardless of permissions configuration.
        if (user && (user.username === 'admin' || user.id === 'admin-hardcoded')) {
          console.log('✅ Super admin access granted for page:', pageName);
          return true;
        }

        // Admin Panel is accessible to all authenticated users
        if (pageName.toLowerCase().includes('admin') || pageName.toLowerCase() === 'admin panel') {
          if (isAuthenticated && user) {
            console.log('✅ Admin Panel access granted to authenticated user');
            return true;
          }
          return false;
        }

        if (!user || !user.piref_role) {
          console.log('❌ No user or piref_role:', { hasUser: !!user, hasPirefRole: !!user?.piref_role });
          return false;
        }

        // Check directly in roles array first
        if (user.piref_role && Array.isArray(user.piref_role) && user.piref_role.length > 0) {
          const roleData = user.piref_role[0];
          if (roleData.roles && Array.isArray(roleData.roles)) {
            const hasPermission = hasPermissionInRoles(roleData.roles, pageName, accessType);
            if (hasPermission) {
              console.log('✅ Permission found in roles array:', { pageName, accessType });
              return true;
            }
            console.log('❌ Permission not found in roles array:', { 
              pageName, 
              accessType, 
              availablePermissions: roleData.roles 
            });
          }
        }

        // Fallback to parsed permissions
        const normalizedPageName = normalizePageName(pageName);
        const pagePerms = pagePermissions[normalizedPageName] || [];
        if (pagePerms.includes(accessType.toLowerCase())) {
          console.log('✅ Permission found in parsed permissions:', { pageName, accessType });
          return true;
        }

        console.log('❌ No permission found:', { 
          pageName, 
          accessType, 
          normalizedPageName,
          availablePagePermissions: Object.keys(pagePermissions),
          pagePerms 
        });

        // NO FALLBACK - Users must have explicit permissions to access pages
        return false;
      },

      /**
       * Check if user can access a department
       * @param {string} departmentId - Department ID to check
       * @returns {boolean}
       */
      canAccessDepartment: (departmentId) => {
        const { user } = get();

        if (!user) return false;

        // Super Admin can access all departments
        if (user.username === 'admin' || user.id === 'admin-hardcoded') {
          return true;
        }

        // Admin users can access all departments
        if (user.role === 'Admin' || (user.piref_role && user.piref_role[0]?.rolename === 'Admin')) {
          return true;
        }

        // Users with no department can access all
        if (!user.departmentId) {
          return true;
        }

        // Otherwise check if user's department matches
        return user.departmentId === departmentId;
      },

      /**
       * Helper: Check if user can read a page
       */
      canReadPage: (pageName) => {
        return get().hasPageAccess(pageName, 'read');
      },

      /**
       * Helper: Check if user can write a page
       */
      canWritePage: (pageName) => {
        return get().hasPageAccess(pageName, 'write');
      },

      /**
       * Helper: Check if user can delete from a page
       */
      canDeletePage: (pageName) => {
        return get().hasPageAccess(pageName, 'delete');
      },

      /**
       * Get the first accessible page route for the user
       * @returns {string|null} - Route path or null if no accessible pages
       */
      getFirstAccessibleRoute: () => {
        const { canReadPage } = get();
        
        // Map of page names to routes (in priority order)
        const pageRoutes = [
          { pageName: 'Admin panel', route: '/admin' },
          { pageName: 'Leadership Dashboard', route: '/' },
          { pageName: 'Tender Intake', route: '/intake' },
          { pageName: 'Tender Overview', route: '/tender-overview' },
          { pageName: 'Tender Article', route: '/tender-article' },
          { pageName: 'Vendor Intake', route: '/vendor-intake' },
          { pageName: 'Evaluation Matrix', route: '/evaluation' },
          { pageName: 'Evaluation Breakdown', route: '/evaluation-breakdown' },
          { pageName: 'Evaluation Recommendation', route: '/evaluation-recommendation' },
          { pageName: 'Benchmark Dashboard', route: '/benchmark' },
          { pageName: 'Integrity Analytics', route: '/integrity' },
          { pageName: 'Justification Composer', route: '/justification' },
          { pageName: 'Award Simulation', route: '/award' },
          { pageName: 'Agent Monitoring', route: '/monitoring' },
          { pageName: 'Integration Management', route: '/integration' },
        ];

        // Find first accessible page
        for (const { pageName, route } of pageRoutes) {
          if (canReadPage(pageName)) {
            console.log('✅ First accessible route found:', route, 'for page:', pageName);
            return route;
          }
        }

        console.log('❌ No accessible routes found for user');
        return null;
      },

      /**
       * Check if user has any Admin panel access
       */
      hasAnyAdminPanelAccess: () => {
        const { user } = get();
        if (!user || !user.piref_role) return false;

        if (user.piref_role && Array.isArray(user.piref_role) && user.piref_role.length > 0) {
          const roleData = user.piref_role[0];
          if (roleData.roles && Array.isArray(roleData.roles)) {
            return roleData.roles.some((perm) => {
              if (typeof perm !== 'string') return false;
              const normalized = perm.toLowerCase();
              return normalized.includes('admin') || normalized.includes('admin panel');
            });
          }
        }

        return false;
      },

      /**
       * Check if current user is an admin
       * @returns {boolean}
       */
      isAdmin: () => {
        const { user } = get();
        if (!user) return false;

        // Check if role is 'Admin'
        if (user.role === 'Admin') {
          return true;
        }

        // Check if rolename in piref_role is 'Admin'
        if (user.piref_role && Array.isArray(user.piref_role) && user.piref_role.length > 0) {
          const roleData = user.piref_role[0];
          if (roleData.rolename === 'Admin') {
            return true;
          }
        }

        return false;
      },

      /**
       * Logout and clear all state
       */
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          permissions: [],
          pagePermissions: {},
        });
        // Explicitly clear persisted storage
        try {
          localStorage.removeItem('auth-storage');
        } catch (e) {
          console.warn('Failed to clear auth storage:', e);
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user and isAuthenticated, permissions are derived
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export { useAuthStore };

