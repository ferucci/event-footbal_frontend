import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import styles from './Login.module.scss';

/**
 * Компонент страницы входа
 * Управляет процессом аутентификации пользователя
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Получаем методы из контекста аутентификации
  const { login } = useAuth();
  // const navigate = useNavigate();

  /**
   * Обработчик отправки формы
   * @param e - Событие формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Вызываем метод login из контекста
      await login(email, password);

      // Перенаправление происходит внутри login()
      // Дополнительный navigate не нужен
    } catch (err) {
      // Обработка ошибок аутентификации
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Please log in</h1>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className={`${styles.inputField} ${error ? styles.hasError : ''}`}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className={`${styles.inputField} ${error ? styles.hasError : ''}`}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;