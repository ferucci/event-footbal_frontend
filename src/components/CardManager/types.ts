import type { CardData } from '@/types';

export interface UseCardManagerProps {
  cardsContainerRef: React.RefObject<HTMLDivElement | null>;
}

export interface CardManagerApi {
  handleCardClick: (
    cardRef: React.RefObject<HTMLDivElement>,
    cardData: CardData
  ) => Promise<void>;
  overlayRef: React.RefObject<HTMLDivElement>;
  error: string | null;
  isLoading: boolean;
}

export interface CardAnimationMethods {
  activateCard: (card: HTMLDivElement) => void;
  deactivateCard: (card: HTMLDivElement) => void;
  createPlaceholder: (card: HTMLDivElement) => void;
  removePlaceholder: () => void;
  showOverlay: () => void;
  hideOverlay: () => void;
  resetActiveCards: () => void;
}