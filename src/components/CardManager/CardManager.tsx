import type { CardData } from '@/types';
import React, { useEffect, useRef, useState } from 'react';
import { handleApiError, sendWithRetry } from './apiHandlers';
import { CardAnimator } from './cardAnimation';
import { calculateCardOffsets, setupResizeListener } from './layoutCalculations';

// Интерфейс для пропсов хука - ожидает ref контейнера карточек
interface UseCardManagerProps {
  cardsContainerRef: React.RefObject<HTMLDivElement | null>;
}

// Основной хук для управления карточками
export const useCardManager = ({ cardsContainerRef }: UseCardManagerProps) => {
  const ACTIVE_CARD_TIME = 3000;
  // States
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Refs для элементов:
  const overlayRef = useRef<HTMLDivElement>(null);
  const animatorRef = useRef<CardAnimator | null>(null);
  const bodyRef = useRef<HTMLBodyElement | null>(null);

  // Эффект для инициализации и очистки
  useEffect(() => {
    // Сохраняем ссылку на body при монтировании
    bodyRef.current = document.body as HTMLBodyElement;
    animatorRef.current = new CardAnimator(overlayRef, bodyRef, cardsContainerRef);

    calculateCardOffsets(cardsContainerRef);
    const cleanupResizeListener = setupResizeListener(cardsContainerRef);

    return () => {
      cleanupResizeListener();
      // очистка
      if (animatorRef.current) animatorRef.current.cleanup();
    };
  }, []);

  // Обработчик клика по карточке
  const handleCardClick = async (
    cardRef: React.RefObject<HTMLDivElement>,
    cardData: CardData
  ) => {
    if (!cardRef.current || isLoading || !animatorRef.current || animatorRef.current.hasActiveCard()) return;

    setIsLoading(true);
    setError(null);

    try {
      await sendWithRetry(cardData);
      setRetryCount(0);

      animatorRef.current.resetActiveCards();
      animatorRef.current.createPlaceholder(cardRef.current);
      animatorRef.current.activateCard(cardRef.current);
      animatorRef.current.showOverlay();

      setTimeout(() => {
        animatorRef.current?.deactivateCard(cardRef.current!);
        animatorRef.current?.hideOverlay();
        animatorRef.current?.removePlaceholder();
      }, ACTIVE_CARD_TIME);

    } catch (err) {
      setError(handleApiError(err, retryCount));
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCardClick,
    overlayRef,
    error,
    isLoading,
  };
};