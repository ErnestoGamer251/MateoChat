import React, { createContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const login = async (username, password) => {
    try {
      const res = await axios.post('http://localhost:3000/login', { username, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      fetchUserProfile(res.data.token);
    } catch (error) {
      console.error('Error en el inicio de sesión', error);
    }
  };

  const fetchUserProfile = async (jwtToken) => {
    try {
      const res = await axios.get('http://localhost:3000/profile', {
        headers: { Authorization: jwtToken },
      });
      setUser(res.data);
    } catch (error) {
      console.error('Error al obtener perfil', error);
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
