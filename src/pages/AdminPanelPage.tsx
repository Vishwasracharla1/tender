import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Users, Shield } from 'lucide-react';
import { UserManagement } from '../components/Admin/UserManagement';
import { RoleManagement } from '../components/Admin/RoleManagement';

interface AdminPanelPageProps {
  onNavigate: (page: 'intake' | 'evaluation' | 'benchmark' | 'integrity' | 'justification' | 'award' | 'leadership' | 'monitoring' | 'integration' | 'tender-article' | 'tender-overview' | 'tender-prebidding' | 'admin') => void;
}

export function AdminPanelPage({ onNavigate }: AdminPanelPageProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

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
            <div className="p-6">
              {activeTab === 'users' ? (
                <UserManagement />
              ) : (
                <RoleManagement />
              )}
            </div>
          </div>
        </main>
      </div>

    </>
  );
}

