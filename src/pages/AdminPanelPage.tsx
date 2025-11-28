import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Users, Shield, UserPlus, Key, Edit, Trash2, Plus, X } from 'lucide-react';
import { fetchAdminPanelUsers, fetchAdminPanelRoles, type AdminPanelInstanceItem } from '../services/api';

interface AdminPanelPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'admin') => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export function AdminPanelPage({ onNavigate }: AdminPanelPageProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<Role | null>(null);

  // Fetch admin panel data from API
  useEffect(() => {
    const loadAdminPanelData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch users and roles in parallel
        const [userInstances, roleInstances] = await Promise.all([
          fetchAdminPanelUsers(3000),
          fetchAdminPanelRoles(3000),
        ]);

        console.log('📥 Admin panel users received:', userInstances);
        console.log('📥 Admin panel roles received:', roleInstances);

        // Map users from API response
        const mappedUsers: User[] = userInstances.map((instance: AdminPanelInstanceItem) => ({
          id: instance.id?.toString() || '',
          name: instance.name || instance.username || 'Unknown',
          email: instance.email || '',
          role: instance.role || 'Unknown',
          department: instance.department || 'Unknown',
          status: (instance.status === 'active' || instance.status === 'inactive' 
            ? instance.status 
            : 'active') as 'active' | 'inactive',
          lastLogin: '', // Not in API response
        }));

        // Map roles from API response
        const mappedRoles: Role[] = roleInstances.map((instance: AdminPanelInstanceItem) => {
          // Extract role name - API returns 'rolename' field
          const roleName = (instance as any).rolename || instance.name || instance.role || 'Unknown';
          
          // Extract permissions - API returns 'roles' array
          const permissionsArray = (instance as any).roles || instance.permissions;
          const permissions = Array.isArray(permissionsArray)
            ? permissionsArray
            : (permissionsArray 
                ? (typeof permissionsArray === 'string' ? [permissionsArray] : [String(permissionsArray)])
                : (instance.permission ? [instance.permission] : []));
          
          // Count users with this role
          const userCount = mappedUsers.filter(user => user.role === roleName).length;

          return {
            id: instance.id?.toString() || roleName,
            name: roleName,
            description: instance.description || `Role: ${roleName}`,
            permissions: permissions.length > 0 ? permissions : ['View All'],
            userCount: userCount,
          };
        });

        setUsers(mappedUsers);
        setRoles(mappedRoles);
        console.log('✅ Mapped users:', mappedUsers);
        console.log('✅ Mapped roles:', mappedRoles);
      } catch (err) {
        console.error('❌ Error loading admin panel data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load admin panel data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminPanelData();
  }, []);

  // No filtering needed since search is removed
  const filteredUsers = users;
  const filteredRoles = roles;

  return (
    <>
      <Sidebar currentPage="admin" onNavigate={onNavigate} />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100" style={{ marginLeft: 'var(--sidebar-offset, 0px)' }}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage users, roles, and permissions</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Content Area with Integrated Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Tabs - Integrated into content card */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border-b-2 border-sky-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'roles'
                    ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-700 border-b-2 border-sky-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Shield className="w-5 h-5" />
                Roles
              </button>
            </div>
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                <p className="mt-4 text-gray-600">Loading admin panel data...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="text-red-600 mb-4">
                  <Shield className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-semibold">Error loading data</p>
                  <p className="text-sm mt-2">{error}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  Retry
                </button>
              </div>
            ) : activeTab === 'users' ? (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white via-sky-50/50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">User Management</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add User
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b-2 border-slate-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Name</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Role</th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Department</th>
                        <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                        <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="bg-white hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/30 transition-all duration-200">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-semibold text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-700">{user.email}</td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-700">{user.department}</td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors duration-200">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No users found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white via-sky-50/50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Role Management</h2>
                      <p className="text-sm text-gray-500 mt-0.5">{filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''} found</p>
                    </div>
                    <button className="px-4 py-2 bg-gradient-to-r from-sky-400 to-blue-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Role
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredRoles.map((role) => (
                      <div
                        key={role.id}
                        className="bg-gradient-to-br from-white via-sky-50/30 to-slate-50 rounded-xl border-2 border-slate-200 p-6 hover:border-sky-300 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg">
                              <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                              <p className="text-xs text-gray-500">{role.userCount} user{role.userCount !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors duration-200">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Permissions</p>
                            {role.permissions.length > 0 && (
                              <button
                                onClick={() => setSelectedRolePermissions(role)}
                                className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                              >
                                View All
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.slice(0, 3).map((permission, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs font-medium rounded-md bg-sky-100 text-sky-700 border border-sky-200"
                              >
                                {permission}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="px-2 py-1 text-xs font-medium rounded-md bg-sky-50 text-sky-600 border border-sky-200">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                            {role.permissions.length === 0 && (
                              <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-500 border border-gray-200">
                                No permissions
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredRoles.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No roles found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Permissions Modal */}
      {selectedRolePermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedRolePermissions.name} - Permissions</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedRolePermissions.permissions.length} permission{selectedRolePermissions.permissions.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => setSelectedRolePermissions(null)}
                  className="p-2 hover:bg-white rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedRolePermissions.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg border border-sky-200 hover:border-sky-300 transition-all duration-200"
                  >
                    <span className="text-sm font-medium text-sky-900">{permission}</span>
                  </div>
                ))}
              </div>
              {selectedRolePermissions.permissions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No permissions assigned</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedRolePermissions(null)}
                className="px-6 py-2 bg-gradient-to-r from-sky-400 to-blue-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

