import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { useUser } from '../contexts/UserContext';

const roles = [
  {
    id: 'student',
    label: 'Student',
    description: 'Access your room and preferences',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Manage hostels and system settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: selectedRole
        })
      });

      const data = await response.json();

      if (data.success) {
        // Use context to store user data
        login(data.student, data.role);
        
        // Redirect based on role
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f5f3e8 0%, #fafafa 50%, #e8f5e9 100%)' }}
    >
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="white" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stable Roomies</h1>
          <p className="text-sm text-gray-500 mt-1">Smart Hostel Roommate Allocation</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Sign in to your account</h2>
            <p className="text-sm text-gray-400 mt-0.5">Select your role to continue</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {roles.map((role) => {
              const active = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => { setSelectedRole(role.id); setError(''); }}
                  className={`relative flex flex-col items-center gap-1.5 py-3.5 px-3 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer
                    ${active
                      ? 'border-green-700 bg-green-50 text-green-800'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {active && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-600" />
                  )}
                  <span className={active ? 'text-green-700' : 'text-gray-400'}>
                    {role.icon}
                  </span>
                  {role.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">credentials</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900
                  placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600
                  focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-medium text-gray-600">
                  Password
                </label>
                <button type="button" className="text-xs text-green-700 hover:text-green-800 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900
                    placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600
                    focus:bg-white transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-150
                flex items-center justify-center gap-2 mt-1 cursor-pointer disabled:opacity-60"
              style={{ background: loading ? '#4a7c2c' : 'linear-gradient(135deg, #2d5016, #4a7c2c)' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                `Sign in as ${roles.find(r => r.id === selectedRole)?.label}`
              )}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Stable Roomies. All rights reserved.
        </p>

      </div>
    </div>
  );
}
