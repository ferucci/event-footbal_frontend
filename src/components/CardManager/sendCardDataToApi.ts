import type { CardData } from "@/types";
import { urlApi } from "@/utils/vars";

// метод для отправки данных карточки на бэкенд
export const sendCardDataToApi = async (cardData: CardData) => {
  try {
    const response = await fetch(`${urlApi}/cards/selected`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Card data sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending card data:', error);
    throw error;
  }
};