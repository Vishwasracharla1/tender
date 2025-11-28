import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEntityInstancesWithReferences,
  postEntityInstances,
  updateKPIDefinition,
  deleteEntityInstances,
} from '../services/api';
import { useAdminStore } from '../store/adminStore';

// Get schema IDs from environment variables
const ROLES_SCHEMA_ID = import.meta.env.VITE_RAK_ROLES_ID;
const USERS_SCHEMA_ID = import.meta.env.VITE_RAK_USERS_ID;

/**
 * Hook to fetch admin dashboard data (users, roles, departments)
 * @param {string|null} userDepartmentFilter - Optional department ID to filter users
 * @returns {Array} Array of query results [usersQuery, rolesQuery, departmentsQuery]
 */
export const useAdminDashboardData = (userDepartmentFilter = null) => {
  const { setUsers, setRoles, setDepartments } = useAdminStore();

  const queries = useQueries({
    queries: [
      // Users query
      {
        queryKey: ['admin-users', userDepartmentFilter],
        queryFn: async () => {
          const users = await fetchEntityInstancesWithReferences(
            USERS_SCHEMA_ID,
            3000,
            'TIDB'
          );

          // Filter by department if provided
          let filteredUsers = users;
          if (userDepartmentFilter) {
            filteredUsers = users.filter(
              (user) => user.departmentId === userDepartmentFilter
            );
          }

          // Update store
          setUsers(users); // Store all users, but return filtered
          return filteredUsers;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      // Roles query
      {
        queryKey: ['admin-roles'],
        queryFn: async () => {
          const roles = await fetchEntityInstancesWithReferences(
            ROLES_SCHEMA_ID,
            3000,
            'TIDB'
          );
          setRoles(roles);
          return roles;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      // Departments query (using static data for now)
      {
        queryKey: ['admin-departments'],
        queryFn: async () => {
          // Import departments from data file
          const { RAK_DEPARTMENTS } = await import('../data/departments');
          setDepartments(RAK_DEPARTMENTS);
          return RAK_DEPARTMENTS;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes (static data)
      },
    ],
  });

  return queries;
};

/**
 * Mutation hook for creating users
 */
export const usePostEntityInstancesUser = () => {
  const queryClient = useQueryClient();
  const { setUsers } = useAdminStore();

  return useMutation({
    mutationFn: async ({ payload }) => {
      const result = await postEntityInstances(USERS_SCHEMA_ID, payload);
      return result;
    },
    onSuccess: async () => {
      // Invalidate and refetch users
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      // Refetch to update store
      const users = await fetchEntityInstancesWithReferences(
        USERS_SCHEMA_ID,
        3000,
        'TIDB'
      );
      setUsers(users);
    },
  });
};

/**
 * Mutation hook for creating roles
 */
export const usePostEntityInstancesRole = () => {
  const queryClient = useQueryClient();
  const { setRoles } = useAdminStore();

  return useMutation({
    mutationFn: async ({ payload }) => {
      const result = await postEntityInstances(ROLES_SCHEMA_ID, payload);
      return result;
    },
    onSuccess: async () => {
      // Invalidate and refetch roles
      await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      // Refetch to update store
      const roles = await fetchEntityInstancesWithReferences(
        ROLES_SCHEMA_ID,
        3000,
        'TIDB'
      );
      setRoles(roles);
    },
  });
};

/**
 * Mutation hook for updating users
 */
export const useUpdateInstanceUser = () => {
  const queryClient = useQueryClient();
  const { setUsers } = useAdminStore();

  return useMutation({
    mutationFn: async ({ payload }) => {
      const result = await updateKPIDefinition(USERS_SCHEMA_ID, payload);
      return result;
    },
    onSuccess: async () => {
      // Invalidate and refetch users
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      // Refetch to update store
      const users = await fetchEntityInstancesWithReferences(
        USERS_SCHEMA_ID,
        3000,
        'TIDB'
      );
      setUsers(users);
    },
  });
};

/**
 * Mutation hook for updating roles
 */
export const useUpdateInstanceRole = () => {
  const queryClient = useQueryClient();
  const { setRoles } = useAdminStore();

  return useMutation({
    mutationFn: async ({ payload }) => {
      const result = await updateKPIDefinition(ROLES_SCHEMA_ID, payload);
      return result;
    },
    onSuccess: async () => {
      // Invalidate and refetch roles
      await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      // Refetch to update store
      const roles = await fetchEntityInstancesWithReferences(
        ROLES_SCHEMA_ID,
        3000,
        'TIDB'
      );
      setRoles(roles);
    },
  });
};

/**
 * Mutation hook for deleting users
 */
export const useDeleteEntityInstancesUser = () => {
  const queryClient = useQueryClient();
  const { setUsers } = useAdminStore();

  return useMutation({
    mutationFn: async ({ filter }) => {
      const result = await deleteEntityInstances(USERS_SCHEMA_ID, filter);
      return result;
    },
    onSuccess: async () => {
      // Invalidate and refetch users
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      // Refetch to update store
      const users = await fetchEntityInstancesWithReferences(
        USERS_SCHEMA_ID,
        3000,
        'TIDB'
      );
      setUsers(users);
    },
  });
};

/**
 * Mutation hook for deleting roles
 */
export const useDeleteEntityInstancesRole = () => {
  const queryClient = useQueryClient();
  const { setRoles } = useAdminStore();

  return useMutation({
    mutationFn: async ({ filter }) => {
      const result = await deleteEntityInstances(ROLES_SCHEMA_ID, filter);
      return result;
    },
    onSuccess: async () => {
      // Invalidate and refetch roles
      await queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      // Refetch to update store
      const roles = await fetchEntityInstancesWithReferences(
        ROLES_SCHEMA_ID,
        3000,
        'TIDB'
      );
      setRoles(roles);
    },
  });
};

