import type { useLocation } from "react-router-dom";

/**
 * Интерфейс контекста аутентификации.
 * Определяет все методы и состояния, доступные через useAuth()
 */
export interface AuthContextType {
  isAuthenticated: boolean; // Флаг аутентификации пользователя
  user: any; // Данные пользователя
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>; // Функция входа
  logout: () => void; // Функция выхода
  checkAuth: () => Promise<boolean>; // Проверка валидности токена
}

// Определяем тип для данных карточки
export interface CardData {
  id: number;
  name: string;
  number: string;
  position: string;
  height: string;
  weight: string;
  rate: number;
  image: string;
  country: string;
}

export interface CardProps extends CardData {
  onClick: (
    cardRef: React.RefObject<HTMLDivElement>,
    cardData: Omit<CardProps, 'onClick'>
  ) => void;
}

export interface LocationState {
  from?: {
    pathname: string;
  };
}

export type LocationWithState = ReturnType<typeof useLocation> & {
  state: LocationState;
};