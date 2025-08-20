import type { RefObject } from 'react';
import type { CardAnimationMethods } from './types';

export class CardAnimator implements CardAnimationMethods {
  private activeCard: HTMLDivElement | null = null;
  private placeholderRef: HTMLDivElement | null = null;
  private overlayRef: RefObject<HTMLDivElement | null>;
  private bodyRef: RefObject<HTMLBodyElement | null>;
  private cardsContainerRef: RefObject<HTMLDivElement | null>;
  private cardClickHandler: ((e: Event) => void) | null = null;
  // сохранение ссылки на коллбек конца анимации
  private animationEndCallback?: () => void;
  private onAnimationStateChange: ((isAnimating: boolean) => void) | null = null;

  constructor(
    overlayRef: RefObject<HTMLDivElement | null>,
    bodyRef: RefObject<HTMLBodyElement | null>,
    cardsContainerRef: RefObject<HTMLDivElement | null>,
    onAnimationStateChange?: (isAnimating: boolean) => void
  ) {
    this.overlayRef = overlayRef;
    this.bodyRef = bodyRef;
    this.cardsContainerRef = cardsContainerRef;
    this.onAnimationStateChange = onAnimationStateChange || null;
    this.cardClickHandler = this.handleCardClick.bind(this);
  }

  private setAnimationState(isAnimating: boolean) {
    if (this.onAnimationStateChange) {
      this.onAnimationStateChange(isAnimating);
    }
  }

  private handleCardClick(e: Event) {
    const target = e.target as HTMLElement;
    // Если клик не по кнопке выбора - предотвращаем действие
    if (!target.closest('.selected-label') && !target.matches('.selected-label')) {
      e.stopPropagation();
    }
  }

  // плейсхолдер на место карточки
  createPlaceholder(card: HTMLDivElement) {
    this.removePlaceholder(); // Удаляем старый, если есть

    const rect = card.getBoundingClientRect();
    const placeholder = document.createElement('div');

    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.visibility = 'hidden';

    this.placeholderRef = placeholder;
    card.parentNode?.insertBefore(placeholder, card);
  }

  removePlaceholder() {
    if (this.placeholderRef && this.placeholderRef.parentNode) {
      this.placeholderRef.parentNode.removeChild(this.placeholderRef);
    }
    this.placeholderRef = null;
  }

  // установка позиции карточки (для анимации)
  private setCardPosition(card: HTMLDivElement) {
    const rect = card.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    card.style.setProperty('--card-top', `${rect.top + scrollTop}px`);
    card.style.setProperty('--card-left', `${rect.left + scrollLeft}px`);
    card.style.setProperty('--card-scale', '1');
  }

  private setSelectedLabelVisibility(card: HTMLDivElement, isVisible: boolean) {
    const selectedLabel = card.querySelector('.selected-label') as HTMLElement | null;
    if (!selectedLabel) return;

    selectedLabel.style.opacity = isVisible ? '1' : '0';
    selectedLabel.style.visibility = isVisible ? 'visible' : 'hidden';
  }

  resetCardPosition(card: HTMLDivElement) {
    card.style.position = '';
    card.style.top = '';
    card.style.left = '';
    card.style.width = '';
    card.style.zIndex = '';
    card.style.transform = '';
    card.style.transition = '';
  }

  // сброс всех активных карточек
  resetActiveCards(isCardSelected: boolean = false) {
    const cards = this.cardsContainerRef.current?.querySelectorAll('.card');
    cards?.forEach((card) => {
      if (!isCardSelected) {
        // Если карточка НЕ выбрана - сбрасываем ВСЁ
        card.classList.remove('active');
        card.classList.remove('card--selected');
        card.classList.remove('deactivating');

        if (this.cardClickHandler) {
          card.removeEventListener('click', this.cardClickHandler);
        }

        this.resetCardPosition(card as HTMLDivElement);
        this.setSelectedLabelVisibility(card as HTMLDivElement, false);
      }
    });

    this.activeCard = null;
  }

  activateCard(card: HTMLDivElement) {
    if (!this.bodyRef.current) return;
    this.setAnimationState(true); // Начинаем анимацию
    this.resetActiveCards(); // Сначала сбрасываем все

    requestAnimationFrame(() => {
      this.setCardPosition(card);
      card.classList.add('card--active');
      this.bodyRef.current!.style.overflow = 'hidden';
      this.activeCard = card;
      this.setSelectedLabelVisibility(card, true);

      if (this.cardClickHandler) {
        // Используем capture phase для более надежного перехвата
        card.addEventListener('click', this.cardClickHandler, true);
      }
      // Ждем завершения анимации увеличения
      card.addEventListener('animationend', () => {
        this.setAnimationState(false); // Завершаем анимацию
      }, { once: true });
    });
  }

  deactivateCard(card: HTMLDivElement, preserveSelection: boolean = false) {
    if (!this.bodyRef.current || !card) return;

    this.setAnimationState(true); // Начинаем анимацию уменьшения

    // Убираем обработчик сразу
    if (this.cardClickHandler) {
      card.removeEventListener('click', this.cardClickHandler, true);
    }

    card.classList.add('deactivating');
    card.classList.remove('card--active');

    const cleanup = () => {
      if (this.animationEndCallback) {
        card.removeEventListener('animationend', this.animationEndCallback);
      }

      // Сохраняем надпись только если explicitly указано
      if (!preserveSelection) {
        this.setSelectedLabelVisibility(card, false);
      }

      this.resetCardPosition(card);
      card.classList.remove('deactivating');
      this.bodyRef.current!.style.overflow = '';

      if (this.activeCard === card) {
        this.activeCard = null;
      }
      this.setAnimationState(false); // Завершаем анимацию
    };

    // Если анимация уже завершена, сразу чистим
    if (!card.classList.contains('deactivating')) {
      cleanup();
    } else {
      this.animationEndCallback = cleanup;
      card.addEventListener('animationend', this.animationEndCallback, { once: true });
    }
  }

  showOverlay() {
    if (this.overlayRef.current) {
      this.overlayRef.current.style.display = 'block';
      setTimeout(() => {
        if (this.overlayRef.current) {
          this.overlayRef.current.classList.add('active');
        }
      }, 10);
    }
  }

  hideOverlay() {
    if (this.overlayRef.current) {
      this.overlayRef.current.classList.remove('active');
      setTimeout(() => {
        if (this.overlayRef.current && !this.overlayRef.current.classList.contains('active')) {
          this.overlayRef.current.style.display = 'none';
        }
      }, 300); // Время анимации
    }
  }

  cleanup() {
    this.resetActiveCards();
    this.removePlaceholder();
    this.hideOverlay();

    if (this.activeCard && this.animationEndCallback) {
      this.activeCard.removeEventListener('animationend', this.animationEndCallback);
    }

    this.activeCard = null;
  }

  hasActiveCard = () => {
    return this.activeCard !== null;
  };
}