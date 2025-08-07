import Login from '@/components/auth/Login';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Dinamo from '@/pages/Dinamo';
import Spartak from '@/pages/Spartak';
import '@/styles/main.scss';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { PATH_DINAMO, PATH_LOGIN, PATH_SPARTAK } from './utils/vars';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path={PATH_LOGIN} element={<Login />} />
      <Route path={PATH_DINAMO} element={<ProtectedRoute><Dinamo /></ProtectedRoute>} />
      <Route path={PATH_SPARTAK} element={<ProtectedRoute><Spartak /></ProtectedRoute>} />
    </Routes>
  );
};

export default App;