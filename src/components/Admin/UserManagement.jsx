import { useState, useMemo } from 'react';
import { useAdminDashboardData, usePostEntityInstancesUser, useUpdateInstanceUser, useDeleteEntityInstancesUser } from '../../hooks/useAdminDashboardData';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { Search, Plus, Edit, Trash2, X, Save, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function UserManagement() {
  const { user: currentUser, isAdmin } = useAuthStore();
  const { getRoles, getDepartments } = useAdminStore();
  
  const [usersQuery, rolesQuery, departmentsQuery] = useAdminDashboardData(
    currentUser?.departmentId || null
  );

  const createUserMutation = usePostEntityInstancesUser();
  const updateUserMutation = useUpdateInstanceUser();
  const deleteUserMutation = useDeleteEntityInstancesUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    role: '',
    departmentId: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});

  const users = usersQuery.data || [];
  const roles = rolesQuery.data || getRoles();
  const departments = departmentsQuery.data || getDepartments();
  const isLoading = usersQuery.isLoading || rolesQuery.isLoading || departmentsQuery.isLoading;
  const error = usersQuery.error || rolesQuery.error || departmentsQuery.error;

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchTerm ||
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole =
        !roleFilter ||
        user.role === roleFilter ||
        (user.piref_role && user.piref_role[0]?.rolename === roleFilter);

      const matchesDepartment =
        !departmentFilter ||
        user.departmentId === departmentFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && user.isActive !== false) ||
        (statusFilter === 'inactive' && user.isActive === false);

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, departmentFilter, statusFilter]);

  // Get role hierarchy (simple: Admin > Manager > User)
  const getRoleHierarchy = (roleName) => {
    if (!roleName) return 0;
    const role = roles.find((r) => r.rolename === roleName);
    if (!role) return 0;
    // Simple hierarchy: Admin = 3, Manager = 2, User = 1, others = 0
    if (roleName.toLowerCase().includes('admin')) return 3;
    if (roleName.toLowerCase().includes('manager')) return 2;
    if (roleName.toLowerCase().includes('user')) return 1;
    return 0;
  };

  // Only admins can edit/delete users
  const canEditUser = (targetUser) => {
    return isAdmin();
  };

  const canDeleteUser = (targetUser) => {
    return isAdmin();
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        password: '', // Never show password
        role: user.role || (user.piref_role && user.piref_role[0]?.rolename) || '',
        departmentId: user.departmentId || '',
        isActive: user.isActive !== false,
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        role: '',
        departmentId: '',
        isActive: true,
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      role: '',
      departmentId: '',
      isActive: true,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.email.includes('@')) errors.email = 'Email must be valid';
    if (!editingUser && !formData.password.trim()) errors.password = 'Password is required for new users';
    if (!formData.role) errors.role = 'Role is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const selectedRole = roles.find((r) => r.rolename === formData.role);
      if (!selectedRole) {
        setFormErrors({ role: 'Selected role not found' });
        return;
      }

      // Generate UUID format ID: user-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const generateUUID = () => {
        const hex = '0123456789abcdef';
        const generateSegment = (length) => {
          return Array.from({ length }, () => hex[Math.floor(Math.random() * 16)]).join('');
        };
        return `user-${generateSegment(8)}-${generateSegment(4)}-${generateSegment(4)}-${generateSegment(4)}-${generateSegment(12)}`;
      };

      // Build payload matching curl structure exactly - order must match curl
      const now = new Date().toISOString();
      const payload = {
        lastName: formData.lastName.trim(),
        role: formData.role,
        isActive: formData.isActive,
        firstName: formData.firstName.trim(),
        createdAt: editingUser ? undefined : now,
        password: formData.password || undefined,
        id: editingUser ? editingUser.id : generateUUID(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        updatedAt: now,
      };

      // Remove undefined fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log('📤 User payload (matching curl structure):', payload);

      if (editingUser) {
        await updateUserMutation.mutateAsync({ payload });
      } else {
        await createUserMutation.mutateAsync({ payload });
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      setFormErrors({ submit: error.message || 'Failed to save user' });
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    try {
      await deleteUserMutation.mutateAsync({
        filter: { id: deleteUser.id },
      });
      setIsDeleteModalOpen(false);
      setDeleteUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + (error.message || 'Unknown error'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Error loading users: {error.message}</div>
      </div>
    );
  }

  const uniqueRoles = [...new Set(roles.map((r) => r.rolename))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleName = user.role || (user.piref_role && user.piref_role[0]?.rolename) || 'N/A';
                  const department = departments.find((d) => d.id === user.departmentId);
                  const canEdit = canEditUser(user);
                  const canDelete = canDeleteUser(user);

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{roleName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {department?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <button
                              onClick={() => handleOpenModal(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {editingUser ? 'Edit User' : 'Create User'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.username && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={`w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a role</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {formErrors.role && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
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
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {createUserMutation.isPending || updateUserMutation.isPending
                    ? 'Saving...'
                    : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete user{' '}
              <strong>
                {deleteUser.firstName} {deleteUser.lastName}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteUserMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

