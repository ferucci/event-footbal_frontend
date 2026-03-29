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

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [pendingCardData, setPendingCardData] = useState<CardData | null>(null);

  // Храню все связанные данные в одном объекте для согласованности
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
    setIsAnimating(false); // Сбрасываю состояние анимации
    setShowActionText(false); // Скрываю надпись при очистке
  }, [clearActiveCardTimeout]);

  // Эффект для инициализации и очистки
  useEffect(() => {
    // Сохраняю ссылку на body при монтировании
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

    // Если карточка уже выбрана - ничего не делаю
    if (selectedCardId === cardId) return;
    setSelectedCardId(null);
    // Блокирую если: уже выбрана, идет анимация, загрузка или уже есть активная карточка
    if (selectedCardId === cardId || isAnimating || isLoading || !animatorRef.current || animatorRef.current.hasActiveCard()) {
      return;
    }
    setIsAnimating(true); // Начинаю анимацию
    setShowActionText(false); // Скрываю надпись при открытии новой карточки
    cleanupActiveCard(); // Очищаю предыдущую активную карточку

    // Сохраняю новую активную карточку
    activeCardRef.current.data = cardData;
    activeCardRef.current.element = cardRef.current;

    animatorRef.current.resetActiveCards();
    animatorRef.current.createPlaceholder(cardRef.current);
    animatorRef.current.activateCard(cardRef.current);
    animatorRef.current.showOverlay();

    // Устанавливаю таймер для автоматического скрытия
    // activeCardRef.current.timeoutId = setTimeout(() => {
    //   if (activeCardRef.current.element && selectedCardId !== String(activeCardRef.current.data?.id)) {
    //     animatorRef.current?.deactivateCard(activeCardRef.current.element, false);
    //     animatorRef.current?.hideOverlay();
    //     animatorRef.current?.removePlaceholder();
    //     cleanupActiveCard();
    //     setIsSelectButtonDisabled(false);
    //   }
    // }, ACTIVE_CARD_TIME);

  }, [isLoading, selectedCardId, cleanupActiveCard, isAnimating]);

  // Обработчик кнопки "Выбрать" в карточке
  const handleSelectButtonClick = useCallback(async () => {
    // Блокирую если идет анимация или загрузка
    if (isAnimating || isLoading || !activeCardRef.current.data || !animatorRef.current || !activeCardRef.current.element) return;

    // Сохраняю данные выбранной карточки
    setPendingCardData(activeCardRef.current.data);
    // Показываю политику
    setShowPrivacyModal(true);

    clearActiveCardTimeout();

  }, [clearActiveCardTimeout, isAnimating, isLoading]);

  // Обработчик по оверлею
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

  // Обработчик политики при согласии
  const handlePrivacyAccept = useCallback(async () => {
    if (!pendingCardData || !activeCardRef.current.element) return;

    setIsLoading(true);
    setError(null);
    setIsSelectButtonDisabled(true);
    setShowPrivacyModal(false);

    try {
      await sendWithRetry(pendingCardData);
      setRetryCount(0);

      const cardId = String(pendingCardData.id);
      setSelectedCardId(cardId);

      setTimeout(() => { setShowActionText(true); }, 1000);

      // Устанавливаем таймер для скрытия после выбора
      activeCardRef.current.timeoutId = setTimeout(() => {
        if (activeCardRef.current.element) {
          animatorRef.current?.deactivateCard(activeCardRef.current.element, true);
          animatorRef.current?.hideOverlay();
          animatorRef.current?.removePlaceholder();
          cleanupActiveCard();
          setIsSelectButtonDisabled(false);
        }
      }, ACTIVE_CARD_TIME);

    } catch (err) {
      setError(handleApiError(err, retryCount));
      setRetryCount((prev) => prev + 1);
      setIsSelectButtonDisabled(false);
      // При ошибке возвращаемся к состоянию до выбора
      setShowPrivacyModal(true);
    } finally {
      setIsLoading(false);
      setPendingCardData(null);
    }
  }, [pendingCardData, retryCount, cleanupActiveCard]);

  // Обработчик политики при отказе
  const handlePrivacyReject = useCallback(() => {
    setShowPrivacyModal(false);
    setPendingCardData(null);

    // Восстанавливаем таймер автоскрытия
    if (activeCardRef.current.element && activeCardRef.current.data) {
      activeCardRef.current.timeoutId = setTimeout(() => {
        if (activeCardRef.current.element && selectedCardId !== String(activeCardRef.current.data?.id)) {
          animatorRef.current?.deactivateCard(activeCardRef.current.element, false);
          animatorRef.current?.hideOverlay();
          animatorRef.current?.removePlaceholder();
          cleanupActiveCard();
          setIsSelectButtonDisabled(false);
        }
      }, ACTIVE_CARD_TIME);
    }
  }, [cleanupActiveCard, selectedCardId]);

  return {
    // Возвращаемые значения
    handleCardClick,
    handleSelectButtonClick,
    handleOverlayClick,
    handlePrivacyAccept,
    handlePrivacyReject,
    overlayRef,
    error,
    isLoading,
    selectedCardId,
    isSelectButtonDisabled,
    isAnimating,
    showActionText,
    showPrivacyModal,
    pendingCardData
  };
};