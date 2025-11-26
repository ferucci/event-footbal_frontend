import type { CardData, CardsGridProps } from '@/types';
import { urlApi } from '@/utils/vars';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Card from './Card';
import { useCardManager } from './CardManager/CardManager';
import LoadingSpinner from './LoadingSpinner';

const CardsGrid: React.FC<CardsGridProps> = ({ site }) => {
  const [cardsData, setCardsData] = useState<CardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const {
    handleCardClick,
    handleSelectButtonClick,
    handleOverlayClick,
    overlayRef,
    selectedCardId,
    isSelectButtonDisabled,
    isAnimating,
    showActionText,
  } = useCardManager({ cardsContainerRef });

  // вариант карточки
  const cardVariant = useMemo(() => {
    return site.toLowerCase() === "spartak" ? "photo" : "default";
  }, [site]);

  // Сортировка карточек в случайном порядке (алгоритм Фишера-Йейтса)
  const sortedCards = useMemo(() => {
    const shuffled = [...cardsData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [cardsData]);

  // Эффект для загрузки данных при монтировании компонента
  useEffect(() => {
    const fetchCardsData = async () => {
      try {
        const response = await fetch(`${urlApi}/cards?site=${site}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCardsData(data);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCardsData();
  }, [site]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <section className="cards" id={site.toLowerCase()} ref={cardsContainerRef}>
      {sortedCards.map((card) => {
        return (
          <Card
            key={card.id || sortedCards.length + 1}
            variant={cardVariant}
            id={card.id}
            name={card.name}
            number={card.number}
            position={card.position}
            height={card.height}
            weight={card.weight}
            rate={card.rate}
            image={card.image}
            country={card.country}
            site={card.site}
            onClick={handleCardClick}
            onSelectButtonClick={handleSelectButtonClick}
            isSelected={selectedCardId === String(card.id)}
            isSelectButtonDisabled={isSelectButtonDisabled}
            isAnimating={isAnimating}
            showActionText={showActionText && selectedCardId === String(card.id)}
          />
        );
      })}
      <div
        className="overlay"
        ref={overlayRef}
        onClick={handleOverlayClick}
      ></div>
    </section>
  );
};

export default CardsGrid;