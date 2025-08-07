import { useAuth } from '@/context/AuthContext';
import { PATH_DINAMO, PATH_LOGIN } from '@/utils/vars';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return

  // Если пользователь аутентифицирован - перенаправляем на /site1
  // Если нет - перенаправляем на /login
  return isAuthenticated ?
    <Navigate to={PATH_DINAMO} replace /> :
    <Navigate to={PATH_LOGIN} replace />;
};

export default HomePage;