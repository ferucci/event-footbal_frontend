import type { CardData } from '@/types';
import { urlApi } from '@/utils/vars';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Card from './Card';
import { useCardManager } from './CardManager/CardManager';
import LoadingSpinner from './LoadingSpinner';

const CardsGrid: React.FC = () => {
  const [cardsData, setCardsData] = useState<CardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const { handleCardClick, overlayRef } = useCardManager({ cardsContainerRef });

  // Сортировка карточек
  const sortedCards = useMemo(() => {
    return [...cardsData].sort((a, b) => +b.rate - +a.rate);
  }, [cardsData]);

  // Эффект для загрузки данных при монтировании компонента
  useEffect(() => {
    const fetchCardsData = async () => {
      try {
        const response = await fetch(`${urlApi}/cards`);

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
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <section className="cards" ref={cardsContainerRef}>
      {sortedCards.map((card) => (
        <Card
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
          onClick={handleCardClick}
        />
      ))}
      <div className="overlay" ref={overlayRef}></div>
    </section>
  );
};

export default CardsGrid;