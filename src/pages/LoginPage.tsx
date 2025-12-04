import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { fetchEntityInstancesWithReferences } from '../services/api';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, getFirstAccessibleRoute } = useAuthStore();
  const { validateUserCredentials, setUsers, getUsers } = useAdminStore();

  // Get schema ID from environment
  const USERS_SCHEMA_ID = import.meta.env.VITE_RAK_USERS_ID;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const accessibleRoute = getFirstAccessibleRoute();
      const redirectPath = accessibleRoute || '/';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, getFirstAccessibleRoute]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      // Always fetch users from API to ensure we have the latest data
      if (USERS_SCHEMA_ID) {
        try {
          console.log('📥 Fetching users from API...');
          const users = await fetchEntityInstancesWithReferences(
            USERS_SCHEMA_ID,
            3000,
            'TIDB'
          );
          console.log('✅ Users fetched:', users.length, users);
          setUsers(users);
        } catch (fetchError) {
          console.error('❌ Failed to fetch users from API:', fetchError);
          // Check if we have cached users
          const cachedUsers = getUsers();
          if (cachedUsers.length === 0) {
            throw new Error('Unable to fetch users. Please check your connection and API token.');
          }
          console.log('⚠️ Using cached users:', cachedUsers.length);
        }
      } else {
        throw new Error('Users schema ID not configured');
      }

      await login(
        { username: username.trim(), password },
        validateUserCredentials
      );
      
      // Get first accessible page for user
      const accessibleRoute = getFirstAccessibleRoute();
      
      // Redirect to first accessible page, or default to monitoring if none found
      const redirectPath = accessibleRoute || '/';
      console.log('🔄 Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            Tender Evaluation
          </h1>
          <p className="text-gray-600">System Dashboard</p>
          <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-400 mx-auto rounded-full mt-4"></div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-10">
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-lg">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 text-center">
              Please sign in to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-3 text-base border-2 border-sky-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white text-gray-900 hover:border-sky-400 shadow-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 text-base border-2 border-sky-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200 bg-white text-gray-900 hover:border-sky-400 shadow-sm"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200 transform
                ${!isLoading
                  ? 'bg-gradient-to-r from-sky-400 to-blue-400 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Use your credentials to sign in. Admin: username="admin", password="admin@123"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Tender Evaluation System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

