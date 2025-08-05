import { debounce } from '@/utils/helpers';
import type { RefObject } from 'react';

// Расчет смещений карточек
export const calculateCardOffsets = (
  cardsContainerRef: RefObject<HTMLDivElement | null>
) => {
  const cardsContainer = cardsContainerRef.current;
  if (!cardsContainer) return;

  const cards = Array.from(cardsContainer.querySelectorAll('.card'));
  if (cards.length === 0) return;

  // Расчет на основе ширины контейнера
  const containerWidth = cardsContainer.clientWidth;
  const cardWidth = cards[0]?.clientWidth || 0;
  const cardsPerRow = Math.floor(containerWidth / cardWidth);

  cards.forEach((card, index) => {
    // сбрасываем классы
    card.classList.remove('ml-s', 'ml-m', 'ml-l');
    // Расчет строки и позиции
    const row = Math.floor(index / cardsPerRow);
    // Применяем смещения в зависимости от строки
    if (row === 1) card.classList.add('ml-s');
    else if (row === 2) card.classList.add('ml-m');
    else if (row > 2) card.classList.add('ml-l');
  });
};

export const setupResizeListener = (
  cardsContainerRef: RefObject<HTMLDivElement | null>,
  debounceTime = 100
) => {
  const debouncedCalculate = debounce(
    () => calculateCardOffsets(cardsContainerRef),
    debounceTime
  );

  window.addEventListener('resize', debouncedCalculate);
  return () => window.removeEventListener('resize', debouncedCalculate);
};