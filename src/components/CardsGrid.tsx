import type { CardData, CardsGridProps } from '@/types';
import { urlApi } from '@/utils/vars';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Card from './Card';
import { useCardManager } from './CardManager/CardManager';
import CardPhoto from './CardPhoto';
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

  // Определяем компонент карточки на основе сайта
  const CardComponent = useMemo(() => {
    return site.toLowerCase() === "spartak" ? CardPhoto : Card;
  }, [site]);

  // Сортировка карточек
  const sortedCards = useMemo(() => {
    return [...cardsData].sort((a, b) => +b.rate - +a.rate);
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
          <CardComponent
            key={card.id || sortedCards.length + 1}
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