// Импорт базового URL API из конфигурационных переменных
import { urlApi } from "@/utils/vars";

/**
 * Функция для выполнения входа пользователя
 * @param email - Email пользователя
 * @param password - Пароль пользователя
 * @returns Promise с данными пользователя и токеном
 * @throws Ошибку при неудачной попытке входа
 */
export const login = async (email: string, password: string) => {
  try {
    // Отправка POST-запроса на эндпоинт /auth/login
    const response = await fetch(`${urlApi}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Указываем тип содержимого
      },
      body: JSON.stringify({ email, password }), // Преобразуем данные в JSON
    });

    // Если ответ не успешный (статус не 2xx)
    if (!response.ok) {
      throw new Error('Login failed');
    }

    // Парсим JSON-ответ и возвращаем данные
    return await response.json();
  } catch (error) {
    // Логируем ошибку и пробрасываем её дальше
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Функция для выхода пользователя
 * @returns Promise, который разрешается после попытки выхода
 */
export const logout = async () => {
  try {
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');

    // Если токена нет, просто выходим
    if (!token) return;

    // Отправляем POST-запрос на эндпоинт выхода
    await fetch(`${urlApi}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Передаём токен в заголовках
      },
    });

    // Примечание: Очистка localStorage должна выполняться в вызывающем коде
  } catch (error) {
    // Логируем ошибку, но не прерываем выполнение
    console.error('Logout error:', error);
  }
};

/**
 * Функция для проверки валидности токена
 * @returns Promise с boolean - действителен ли токен
 */
export const verifyToken = async (token: string) => {

  if (!token) return false;

  try {

    // Отправляем GET-запрос на эндпоинт проверки токена
    const response = await fetch(`${urlApi}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Передаём токен
      },
    });
    console.log(token);

    if (response.status === 401) {
      console.log('Токен недействителен или просрочен')
      return false;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Парсим ответ и возвращаем статус валидности
    const data = await response.json();
    return data.isValid;
  } catch (error) {
    // Логируем ошибку и возвращаем false
    console.error('Token verification error:', error);
    return false;
  }
};