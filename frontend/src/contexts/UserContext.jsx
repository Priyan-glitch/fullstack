import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    
    setLoading(false);
  }, []);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated: !!user,
    isStudent: role === 'student',
    isAdmin: role === 'admin',
    login,
    logout,
    updateUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
