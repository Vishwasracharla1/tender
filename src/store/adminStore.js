import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
  persist(
    (set, get) => ({
      users: [],
      roles: [],
      departments: [],

      /**
       * Set users list
       */
      setUsers: (usersList) => {
        set({ users: Array.isArray(usersList) ? usersList : [] });
      },

      /**
       * Set roles list
       */
      setRoles: (rolesList) => {
        set({ roles: Array.isArray(rolesList) ? rolesList : [] });
      },

      /**
       * Set departments list
       */
      setDepartments: (departmentsList) => {
        set({ departments: Array.isArray(departmentsList) ? departmentsList : [] });
      },

      /**
       * Get all users
       */
      getUsers: () => {
        return get().users;
      },

      /**
       * Get all roles
       */
      getRoles: () => {
        return get().roles;
      },

      /**
       * Get all departments
       */
      getDepartments: () => {
        return get().departments;
      },

      /**
       * Get user by ID
       */
      getUserById: (id) => {
        return get().users.find((user) => user.id === id);
      },

      /**
       * Get role by ID
       */
      getRoleById: (id) => {
        return get().roles.find((role) => role.id === id);
      },

      /**
       * Get department by ID
       */
      getDepartmentById: (id) => {
        return get().departments.find((dept) => dept.id === id);
      },

      /**
       * Get user by username or email (case-insensitive)
       */
      getUserByIdentifier: (identifier) => {
        if (!identifier) return null;
        const normalized = identifier.toLowerCase().trim();
        return get().users.find(
          (user) =>
            (user.username && user.username.toLowerCase() === normalized) ||
            (user.email && user.email.toLowerCase() === normalized)
        );
      },

      /**
       * Validate user credentials
       * @param {string} username - Username or email
       * @param {string} password - Password
       * @returns {Object|null} - User object without password, or null if invalid
       */
      validateUserCredentials: (username, password) => {
        console.log('🔐 Validating credentials:', { username, passwordLength: password?.length });
        
        // Hardcoded admin fallback
        if (username === 'admin' && password === 'admin@123') {
          console.log('✅ Using hardcoded admin');
          return {
            id: 'admin-hardcoded',
            username: 'admin',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'Admin',
            isActive: true,
            piref_role: [
              {
                rolename: 'Admin',
                roles: [
                  'Admin panel_read',
                  'Admin panel_write',
                  'Admin panel_update',
                  'Admin panel_delete',
                  'Dashboard_read',
                  'Dashboard_write',
                ],
                id: 'admin-role',
              },
            ],
          };
        }

        // Get users from store
        const users = get().users;
        console.log('👥 Users in store:', users.length);
        
        // Check against users array
        const user = get().getUserByIdentifier(username);
        console.log('🔍 User found:', user ? { id: user.id, username: user.username, email: user.email, hasPassword: !!user.password } : 'NOT FOUND');

        if (!user) {
          console.log('❌ User not found');
          return null;
        }

        // Check if user is active
        if (user.isActive === false) {
          console.log('❌ User is inactive');
          return null;
        }

        // Check password (plaintext comparison as per requirements)
        // Trim both passwords to handle any whitespace issues
        const storedPassword = String(user.password || '').trim();
        const providedPassword = String(password || '').trim();
        
        console.log('🔑 Password check:', {
          storedPasswordLength: storedPassword.length,
          providedPasswordLength: providedPassword.length,
          storedPassword: storedPassword.substring(0, 5) + '...', // Only log first 5 chars for security
          providedPassword: providedPassword.substring(0, 5) + '...',
          match: storedPassword === providedPassword,
        });
        
        if (storedPassword !== providedPassword) {
          console.log('❌ Password mismatch');
          return null;
        }

        console.log('✅ Credentials validated successfully');
        
        // Return user without password but preserve piref_role
        const { password: _, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          piref_role: user.piref_role, // Preserve for permission checks
        };
      },

      /**
       * Get users with role and department names enriched
       */
      getUsersWithRoleAndDepartment: () => {
        const { users, roles, departments } = get();

        return users.map((user) => {
          const roleName = user.role || (user.piref_role && user.piref_role[0]?.rolename) || 'N/A';
          const role = roles.find((r) => r.rolename === roleName || r.id === user.piref_role?.[0]?.id);

          const department = user.departmentId
            ? departments.find((d) => d.id === user.departmentId || d.name === user.departmentId)
            : null;

          return {
            ...user,
            roleName: role?.rolename || roleName,
            departmentName: department?.name || 'N/A',
          };
        });
      },
    }),
    {
      name: 'admin-storage',
    }
  )
);

export { useAdminStore };

