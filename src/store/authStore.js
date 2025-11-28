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
 * Check if user has access to a page with specific access type
 * @param {string[]} rolesArray - Array of permission strings from user.piref_role[0].roles
 * @param {string} pageName - Page name to check
 * @param {string} accessType - Access type: 'read', 'write', 'update', 'delete'
 * @returns {boolean}
 */
const hasPermissionInRoles = (rolesArray, pageName, accessType) => {
  if (!Array.isArray(rolesArray)) return false;

  const normalizedPageName = normalizePageName(pageName);
  const normalizedAccessType = accessType.toLowerCase();

  // Check for exact match first
  const exactMatch = rolesArray.some((permission) => {
    if (typeof permission !== 'string') return false;
    const lastUnderscoreIndex = permission.lastIndexOf('_');
    if (lastUnderscoreIndex === -1) return false;
    
    const permPageName = normalizePageName(permission.substring(0, lastUnderscoreIndex).trim());
    const permAccessType = permission.substring(lastUnderscoreIndex + 1).trim().toLowerCase();
    
    return permPageName.toLowerCase() === normalizedPageName.toLowerCase() &&
           permAccessType === normalizedAccessType;
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

        // Validate credentials using adminStore function
        const user = validateUser(username, password);

        if (!user) {
          console.log('❌ AuthStore: User validation failed');
          throw new Error('Invalid credentials');
        }

        console.log('✅ AuthStore: User validated:', { id: user.id, username: user.username, email: user.email });

        // Extract permissions from piref_role
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
        const { user, pagePermissions } = get();

        if (!user || !user.piref_role) {
          return false;
        }

        // Admin Panel requires explicit permissions (no fallback)
        if (pageName.toLowerCase().includes('admin') || pageName.toLowerCase() === 'admin panel') {
          // Check directly in roles array first
          if (user.piref_role && Array.isArray(user.piref_role) && user.piref_role.length > 0) {
            const roleData = user.piref_role[0];
            if (roleData.roles && Array.isArray(roleData.roles)) {
              if (hasPermissionInRoles(roleData.roles, pageName, accessType)) {
                return true;
              }
            }
          }
          // Fallback to parsed permissions
          const normalizedPageName = normalizePageName(pageName);
          const pagePerms = pagePermissions[normalizedPageName] || [];
          return pagePerms.includes(accessType.toLowerCase());
        }

        // For other pages, check permissions first
        if (user.piref_role && Array.isArray(user.piref_role) && user.piref_role.length > 0) {
          const roleData = user.piref_role[0];
          if (roleData.roles && Array.isArray(roleData.roles)) {
            if (hasPermissionInRoles(roleData.roles, pageName, accessType)) {
              return true;
            }
          }
        }

        // Fallback to parsed permissions
        const normalizedPageName = normalizePageName(pageName);
        const pagePerms = pagePermissions[normalizedPageName] || [];
        if (pagePerms.includes(accessType.toLowerCase())) {
          return true;
        }

        // If authenticated but no specific permissions, allow read access for non-admin pages
        if (accessType === 'read' && get().isAuthenticated) {
          return true;
        }

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

