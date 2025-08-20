import type { CardData } from '@/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { handleApiError, sendWithRetry } from './apiHandlers';
import { CardAnimator } from './cardAnimation';

// Интерфейс для пропсов хука - ожидает ref контейнера карточек
interface UseCardManagerProps {
  cardsContainerRef: React.RefObject<HTMLDivElement | null>;
}

// Основной хук для управления карточками
export const useCardManager = ({ cardsContainerRef }: UseCardManagerProps) => {
  const ACTIVE_CARD_TIME = 10000;
  // States
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  // состояние для отслеживания блокировки кнопки
  const [isSelectButtonDisabled, setIsSelectButtonDisabled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showActionText, setShowActionText] = useState(false); // Новое состояние для надписи

  // Refs для элементов:
  const overlayRef = useRef<HTMLDivElement>(null);
  const animatorRef = useRef<CardAnimator | null>(null);
  const bodyRef = useRef<HTMLBodyElement | null>(null);

  // Храним все связанные данные в одном объекте для согласованности
  const activeCardRef = useRef<{
    data: CardData | null;
    element: HTMLDivElement | null;
    timeoutId: NodeJS.Timeout | null;
  }>({
    data: null,
    element: null,
    timeoutId: null
  });

  // Очистка таймера
  const clearActiveCardTimeout = useCallback(() => {
    if (activeCardRef.current.timeoutId) {
      clearTimeout(activeCardRef.current.timeoutId);
      activeCardRef.current.timeoutId = null;
    }
  }, []);

  // Полная очистка активной карточки
  const cleanupActiveCard = useCallback(() => {
    clearActiveCardTimeout();
    activeCardRef.current.data = null;
    activeCardRef.current.element = null;
    setIsAnimating(false); // Сбрасываем состояние анимации
    setShowActionText(false); // Скрываем надпись при очистке
  }, [clearActiveCardTimeout]);

  // Эффект для инициализации и очистки
  useEffect(() => {
    // Сохраняем ссылку на body при монтировании
    bodyRef.current = document.body as HTMLBodyElement;
    animatorRef.current = new CardAnimator(overlayRef, bodyRef, cardsContainerRef, setIsAnimating);

    return () => {
      clearActiveCardTimeout();
      if (animatorRef.current) animatorRef.current.cleanup();
    };
  }, [clearActiveCardTimeout]);

  // Обработчик клика по карточке
  const handleCardClick = useCallback(async (
    cardRef: React.RefObject<HTMLDivElement>,
    cardData: CardData
  ) => {
    const cardId = String(cardData.id);

    // Если карточка уже выбрана - ничего не делаем
    if (selectedCardId === cardId) return;
    setSelectedCardId(null);
    // Блокируем если: уже выбрана, идет анимация, загрузка или уже есть активная карточка
    if (selectedCardId === cardId || isAnimating || isLoading || !animatorRef.current || animatorRef.current.hasActiveCard()) {
      return;
    }
    setIsAnimating(true); // Начинаем анимацию
    setShowActionText(false); // Скрываем надпись при открытии новой карточки
    cleanupActiveCard(); // Очищаем предыдущую активную карточку

    // Сохраняем новую активную карточку
    activeCardRef.current.data = cardData;
    activeCardRef.current.element = cardRef.current;

    animatorRef.current.resetActiveCards();
    animatorRef.current.createPlaceholder(cardRef.current);
    animatorRef.current.activateCard(cardRef.current);
    animatorRef.current.showOverlay();

    // Устанавливаем таймер для автоматического скрытия
    activeCardRef.current.timeoutId = setTimeout(() => {
      if (activeCardRef.current.element && selectedCardId !== String(activeCardRef.current.data?.id)) {
        animatorRef.current?.deactivateCard(activeCardRef.current.element, false);
        animatorRef.current?.hideOverlay();
        animatorRef.current?.removePlaceholder();
        cleanupActiveCard();
        setIsSelectButtonDisabled(false);
      }
    }, ACTIVE_CARD_TIME);
  }, [isLoading, selectedCardId, cleanupActiveCard, isAnimating]);

  const handleSelectButtonClick = useCallback(async () => {
    // Блокируем если идет анимация или загрузка
    if (isAnimating || isLoading || !activeCardRef.current.data || !animatorRef.current || !activeCardRef.current.element) return;

    setIsLoading(true);
    setError(null);
    setIsSelectButtonDisabled(true); // Блокируем кнопку
    clearActiveCardTimeout(); // Очищаем таймер автоскрытия

    try {
      await sendWithRetry(activeCardRef.current.data);
      setRetryCount(0);

      const cardId = String(activeCardRef.current.data.id);
      setSelectedCardId(cardId); // Устанавливаем выбранную карточку

      setTimeout(() => { setShowActionText(true); }, 1000)

      // Устанавливаем новый таймер для скрытия после выбора
      activeCardRef.current.timeoutId = setTimeout(() => {
        if (activeCardRef.current.element) {
          // Сохраняем надпись "Выбрано" при уменьшении
          animatorRef.current?.deactivateCard(activeCardRef.current.element, true);
          animatorRef.current?.hideOverlay();
          animatorRef.current?.removePlaceholder();
          cleanupActiveCard();
          setIsSelectButtonDisabled(false); // Разблокировка кнопки после таймаута
        }
      }, ACTIVE_CARD_TIME);

    } catch (err) {
      setError(handleApiError(err, retryCount));
      setRetryCount((prev) => prev + 1);
      setIsSelectButtonDisabled(false); // Разблокировка при ошибки
    } finally {
      setIsLoading(false);
    }
  }, [clearActiveCardTimeout, retryCount, cleanupActiveCard, isLoading, isAnimating]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    // Блокируем клики во время анимации
    if (isAnimating || !animatorRef.current) return;

    const target = e.target as HTMLElement;

    if (animatorRef.current && !target.closest('.card--active')) {
      clearActiveCardTimeout();
      setIsSelectButtonDisabled(false);
      if (activeCardRef.current.element) {
        // Если карточка не была выбрана, скрываем надпись
        const preserveSelection = selectedCardId === String(activeCardRef.current.data?.id);
        animatorRef.current.deactivateCard(activeCardRef.current.element, preserveSelection);
        animatorRef.current.hideOverlay();
        animatorRef.current.removePlaceholder();
        cleanupActiveCard();
      }
    }
  }, [clearActiveCardTimeout, cleanupActiveCard, selectedCardId, isAnimating]);

  return {
    handleCardClick,
    handleSelectButtonClick,
    handleOverlayClick,
    overlayRef,
    error,
    isLoading,
    selectedCardId,
    isSelectButtonDisabled, // Добавляем в возвращаемые значения
    isAnimating, // Возвращаем состояние анимации
    showActionText
  };
};