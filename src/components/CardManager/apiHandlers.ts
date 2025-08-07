import type { CardData } from '@/types';
import { sendCardDataToApi } from './sendCardDataToApi';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// Пробую несколько раз отрпавить данные (на всякий случай)
export const sendWithRetry = async (
  cardData: CardData,
  attempts: number = 0
): Promise<void> => {
  try {
    await sendCardDataToApi(cardData);
  } catch (err) {
    if (attempts < MAX_RETRIES) {
      // Ждем перед повторной попыткой (экспоненциальная задержка)
      const delay = Math.pow(2, attempts) * BASE_DELAY_MS;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return sendWithRetry(cardData, attempts + 1);
    }
    throw err; // Если все попытки исчерпаны
  }
};

export const handleApiError = (error: unknown, retryCount: number): string => {
  const defaultMessage = 'Не удалось выбрать карточку';
  if (error instanceof Error) {
    return retryCount > 0
      ? `${defaultMessage} после ${retryCount} попыток. Ошибка: ${error.message}`
      : `${defaultMessage}. Ошибка: ${error.message}`;
  }
  return defaultMessage;
};