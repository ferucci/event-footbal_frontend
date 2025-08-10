import type { AuthContextType, LocationWithState } from '@/types';
import { PATH_DINAMO, SAFE_PATHS } from '@/utils/vars';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout, verifyToken } from '../api/auth';

// Создание контекста с начальным значением null!
const AuthContext = createContext<AuthContextType>(null!);

/**
 * Провайдер аутентификации. Должен оборачивать всё приложение.
 * @param children - Дочерние компоненты
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation() as LocationWithState;

  const [isLoading, setIsLoading] = useState(true); // Добавляем состояние загрузки

  // Проверка аутентификации при монтировании
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, []);

  /**
   * Функция входа пользователя
   * @param email - Email пользователя
   * @param password - Пароль пользователя
   * @throws Ошибку при неудачной попытке входа
   */
  const login = async (email: string, password: string) => {
    try {
      // Вызов API для входа
      const { accessToken, expiresIn, user } = await apiLogin(email, password);

      // Сохранение данных в localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('token_expires', String(Date.now() + expiresIn * 1000));
      localStorage.setItem('user', JSON.stringify(user));

      // Обновление состояния
      setIsAuthenticated(true);
      setUser(user);

      // Перенаправление 
      const targetPath = location.state?.from?.pathname ||
        localStorage.getItem('last_path') ||
        '/';

      // Проверяем, что путь безопасен 
      const finalPath = SAFE_PATHS.includes(targetPath) ? targetPath : PATH_DINAMO;

      navigate(finalPath, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Пробрасываем ошибку для обработки в компоненте
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expires');
    localStorage.removeItem('user');
    // Сброс состояния
    setIsAuthenticated(false);
    setUser(null);
  };

  /**
   * Функция выхода пользователя
   * Очищает данные аутентификации и перенаправляет на страницу входа
   */
  const logout = () => {
    // Вызов API для выхода (необязательно, но рекомендуется)
    apiLogout();
    // Очистка
    clearAuthData();
    // Перенаправление на страницу входа
    navigate('/login', { replace: true });
  };

  /**
   * Проверка валидности токена аутентификации
   * @returns Promise с boolean - валиден ли токен
   */
  const checkAuth = async () => {
    setIsLoading(true); // Начинаем загрузку

    try {
      const token = localStorage.getItem('token');
      const expires = localStorage.getItem('token_expires');

      // Проверяем наличие и срок действия токена
      if (!token || !expires || Date.now() > Number(expires)) {
        clearAuthData();
        return false;
      }


      const isValid = await verifyToken(token);
      if (!isValid) {
        clearAuthData();
        return false;
      }

      // Восстанавливаем пользователя из localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      clearAuthData();
      return false;
    } finally {
      setIsLoading(false); // Завершаем загрузку в любом случае
    }
  };

  // Предоставление контекста дочерним компонентам
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Хук для доступа к контексту аутентификации
 * @returns Объект AuthContextType
 * @throws Ошибку, если используется вне AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};