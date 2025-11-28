import { useState, useMemo } from 'react';
import { useAdminDashboardData, usePostEntityInstancesRole, useUpdateInstanceRole, useDeleteEntityInstancesRole } from '../../hooks/useAdminDashboardData';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { Search, Plus, Edit, Trash2, X, Save, AlertCircle } from 'lucide-react';

export function RoleManagement() {
  const { user: currentUser, isAdmin } = useAuthStore();
  const { getUsers } = useAdminStore();
  
  const [usersQuery, rolesQuery] = useAdminDashboardData();

  const createRoleMutation = usePostEntityInstancesRole();
  const updateRoleMutation = useUpdateInstanceRole();
  const deleteRoleMutation = useDeleteEntityInstancesRole();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deleteRole, setDeleteRole] = useState(null);
  const [formData, setFormData] = useState({
    rolename: '',
    description: '',
    roles: [], // Array of permission strings
  });
  const [formErrors, setFormErrors] = useState({});

  const users = usersQuery.data || getUsers();
  const roles = rolesQuery.data || [];
  const isLoading = rolesQuery.isLoading;
  const error = rolesQuery.error;

  // Get all unique permissions from existing roles and current user's permissions
  const availablePermissions = useMemo(() => {
    const permissionSet = new Set();

    // Add permissions from current user
    if (currentUser?.piref_role && Array.isArray(currentUser.piref_role) && currentUser.piref_role.length > 0) {
      const userRole = currentUser.piref_role[0];
      if (userRole.roles && Array.isArray(userRole.roles)) {
        userRole.roles.forEach((perm) => {
          if (typeof perm === 'string') {
            permissionSet.add(perm);
          }
        });
      }
    }

    // Add permissions from all existing roles
    roles.forEach((role) => {
      if (role.roles && Array.isArray(role.roles)) {
        role.roles.forEach((perm) => {
          if (typeof perm === 'string') {
            permissionSet.add(perm);
          }
        });
      }
    });

    return Array.from(permissionSet).sort();
  }, [roles, currentUser]);

  // Filter roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        !searchTerm ||
        (role.rolename || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [roles, searchTerm]);

  // Get user count for a role
  const getUserCountForRole = (roleId, rolename) => {
    return users.filter((user) => {
      return (
        user.role === rolename ||
        (user.piref_role &&
          user.piref_role.some((ref) => ref.id === roleId || ref.rolename === rolename))
      );
    }).length;
  };

  // Get role hierarchy (simple: Admin > Manager > User)
  const getRoleHierarchy = (roleName) => {
    if (!roleName) return 0;
    if (roleName.toLowerCase().includes('admin')) return 3;
    if (roleName.toLowerCase().includes('manager')) return 2;
    if (roleName.toLowerCase().includes('user')) return 1;
    return 0;
  };

  // Only admins can edit/delete roles
  const canEditRole = (targetRole) => {
    return isAdmin();
  };

  const canDeleteRole = (targetRole) => {
    if (!isAdmin()) return false;
    // Prevent deletion if role is assigned to users
    const userCount = getUserCountForRole(targetRole.id, targetRole.rolename);
    return userCount === 0;
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        rolename: role.rolename || '',
        description: role.description || '',
        roles: Array.isArray(role.roles) ? [...role.roles] : [],
      });
    } else {
      setEditingRole(null);
      setFormData({
        rolename: '',
        description: '',
        roles: [],
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setFormData({
      rolename: '',
      description: '',
      roles: [],
    });
    setFormErrors({});
  };

  const handleTogglePermission = (permission) => {
    setFormData((prev) => {
      const newRoles = prev.roles.includes(permission)
        ? prev.roles.filter((p) => p !== permission)
        : [...prev.roles, permission];
      return { ...prev, roles: newRoles };
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.rolename.trim()) errors.rolename = 'Role name is required';
    if (formData.roles.length === 0) errors.roles = 'At least one permission is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Generate ID for new roles (format: role-timestamp-random)
      const generateId = () => {
        return `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      };

      // Build payload matching correct curl structure - only rolename, roles, and id
      // Note: description, updatedAt, createdAt are NOT included in the API payload
      const payload = {
        rolename: formData.rolename.trim(),
        roles: formData.roles,
        id: editingRole ? editingRole.id : generateId(),
      };

      console.log('📤 Role payload (matching curl structure):', payload);

      if (editingRole) {
        await updateRoleMutation.mutateAsync({ payload });
      } else {
        await createRoleMutation.mutateAsync({ payload });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving role:', error);
      setFormErrors({ submit: error.message || 'Failed to save role' });
    }
  };

  const handleDeleteClick = (role) => {
    setDeleteRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteRole) return;

    const userCount = getUserCountForRole(deleteRole.id, deleteRole.rolename);
    if (userCount > 0) {
      alert(`Cannot delete role. It is assigned to ${userCount} user(s).`);
      setIsDeleteModalOpen(false);
      setDeleteRole(null);
      return;
    }

    try {
      await deleteRoleMutation.mutateAsync({
        filter: { id: deleteRole.id },
      });
      setIsDeleteModalOpen(false);
      setDeleteRole(null);
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Error loading roles: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
        {isAdmin() && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No roles found
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => {
                  const userCount = getUserCountForRole(role.id, role.rolename);
                  const canEdit = canEditRole(role);
                  const canDelete = canDeleteRole(role);
                  const permissions = Array.isArray(role.roles) ? role.roles : [];

                  return (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {role.rolename}
                      </td>
                      <td className="px-6 py-4">
                        {role.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {permissions.slice(0, 3).map((perm, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {perm}
                            </span>
                          ))}
                          {permissions.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded">
                          {userCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenModal(role)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(role)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {!canDelete && userCount > 0 && (
                            <span className="text-xs text-gray-400" title="Role is assigned to users">
                              Cannot delete
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {editingRole ? 'Edit Role' : 'Create Role'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.rolename}
                  onChange={(e) =>
                    setFormData({ ...formData, rolename: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.rolename ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.rolename && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.rolename}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description for this role"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions * (Select all that apply)
                </label>
                <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {availablePermissions.length === 0 ? (
                    <p className="text-gray-500 text-sm">No permissions available</p>
                  ) : (
                    <div className="space-y-2">
                      {availablePermissions.map((permission) => (
                        <label
                          key={permission}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.roles.includes(permission)}
                            onChange={() => handleTogglePermission(permission)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{permission}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.roles && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.roles}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.roles.length} permission(s)
                </p>
              </div>

              {formErrors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-red-600 text-sm">{formErrors.submit}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {createRoleMutation.isPending || updateRoleMutation.isPending
                    ? 'Saving...'
                    : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete role{' '}
              <strong>{deleteRole.rolename}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteRole(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteRoleMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteRoleMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

