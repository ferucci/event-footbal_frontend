import type { RefObject } from 'react';
import type { CardAnimationMethods } from './types';

export class CardAnimator implements CardAnimationMethods {
  private activeCard: HTMLDivElement | null = null;
  private placeholderRef: HTMLDivElement | null = null;
  private overlayRef: RefObject<HTMLDivElement | null>;
  private bodyRef: RefObject<HTMLBodyElement | null>;
  private cardsContainerRef: RefObject<HTMLDivElement | null>;
  private resetTimeout: NodeJS.Timeout | null = null;

  // сохранение ссылки на коллбек конца анимации
  private animationEndCallback?: () => void;

  constructor(
    overlayRef: RefObject<HTMLDivElement | null>,
    bodyRef: RefObject<HTMLBodyElement | null>,
    cardsContainerRef: RefObject<HTMLDivElement | null>
  ) {
    this.overlayRef = overlayRef;
    this.bodyRef = bodyRef;
    this.cardsContainerRef = cardsContainerRef;
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
    if (this.placeholderRef) {
      this.placeholderRef.remove();
      this.placeholderRef = null;
    }
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

  // сброс всех активных карточек
  resetActiveCards() {
    const cards = this.cardsContainerRef.current?.querySelectorAll('.card');
    cards?.forEach((card) => {
      card.classList.remove('active');
      this.setSelectedLabelVisibility(card as HTMLDivElement, false);
    });
  }

  activateCard(card: HTMLDivElement) {
    if (!this.bodyRef.current) return;

    requestAnimationFrame(() => {
      this.setCardPosition(card);
      card.classList.add('active');
      this.bodyRef.current!.style.overflow = 'hidden';
      this.activeCard = card;
      this.setSelectedLabelVisibility(card, true);
    });
  }

  deactivateCard(card: HTMLDivElement) {
    if (!this.bodyRef.current) return;
    // класс для обратной анимации
    card.classList.add('deactivating');
    card.classList.remove('active');

    this.animationEndCallback = () => {
      card.classList.remove('deactivating');
      this.bodyRef.current!.style.overflow = '';
      card.style.removeProperty('--card-top');
      card.style.removeProperty('--card-left');
      card.style.removeProperty('--card-scale');

      // сбрасываю активную карточку
      this.activeCard = null;
    };

    card.addEventListener('animationend', this.animationEndCallback, { once: true });

  }

  showOverlay() {
    if (this.overlayRef.current) {
      this.overlayRef.current.classList.add('active');
    }
  }

  hideOverlay() {
    if (this.overlayRef.current) {
      this.overlayRef.current.classList.remove('active');
    }
  }

  cleanup() {
    if (this.activeCard && this.animationEndCallback) {
      this.activeCard.removeEventListener('animationend', this.animationEndCallback);
    }

    if (this.resetTimeout) clearTimeout(this.resetTimeout);

    this.resetActiveCards();
    this.removePlaceholder();
    this.hideOverlay();
    this.activeCard = null;
  }

  // проверка наличия активной карточки
  hasActiveCard = () => {
    return this.activeCard !== null;
  };
}