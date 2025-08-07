import type { CardProps } from '@/types';
import React, { useRef } from 'react';

const Card: React.FC<CardProps> = (cardData: CardProps) => {
  const { id, name, number, position, height, weight, rate, image, country, onClick, } = cardData;

  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (cardRef.current) {
      const typedRef: React.RefObject<HTMLDivElement> = {
        current: cardRef.current
      };
      // Подготавливаем данные карточки для отправки
      const cardPayload = {
        id,
        name,
        number,
        position,
        height,
        weight,
        rate,
        image,
        country
      };

      onClick(typedRef, cardPayload);
    }
  };

  return (
    <article className="card" ref={cardRef} onClick={handleClick}>
      <div className="card__inner">
        <div className="card__top">
          <div className="card__level">
            <img src="./images/OHK_Dynamo_logo.svg.png" alt="positioning in the team" />
            <img src={country} alt="location of the country" />
            <span className="rate">{rate}</span>
          </div>
          <div className="card__image">
            <img src={image} alt="football player" />
          </div>
        </div>
        <div className="card__bottom">
          <h3 className="card__title title">{name}</h3>
          <div className="card__info">
            <div className="card__info-items">
              <div className="card__info-item">
                <span>Номер: </span>
                <span>{height}</span>
              </div>
              <div className="card__info-item">
                <span>{number}</span>
                <span>{weight}</span>
              </div>
            </div>
            <div className="status">{position}</div>
          </div>
          <div className="selected-label">
            <svg viewBox="0 0 120 20" width="130" height="30">
              <use href="#icon-success"></use>
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
};

export default Card;