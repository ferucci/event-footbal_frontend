import type { ExtendedCardProps } from '@/types';
import React, { useRef } from 'react';

const Card: React.FC<ExtendedCardProps> = (cardData: ExtendedCardProps) => {
  const {
    id,
    name,
    number,
    position,
    height,
    weight,
    rate,
    image,
    country,
    onClick,
    onSelectButtonClick,
    isSelected,
    isSelectButtonDisabled,
    isAnimating,
    showActionText,
    variant = 'default'
  } = cardData;

  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    // Блокируем если: выбрана, идет анимация, загрузка
    if (isSelected || isAnimating) {
      return;
    }

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

  const handleSelectClick = (e: React.MouseEvent) => {
    // Блокируем клик если: уже выбрано, кнопка отключена или идет загрузка
    if (isSelected || isSelectButtonDisabled || isAnimating) {
      e.stopPropagation();
      return;
    }
    e.stopPropagation(); // Предотвращаем всплытие события к карточке
    onSelectButtonClick();
  };

  const getAbsoluteImagePath = (imgPath: string) => {
    if (imgPath.startsWith('./')) {
      return imgPath.replace('./', '/');
    }
    return imgPath;
  };

  // фото-вариант
  if (variant === 'photo' || variant === 'finale') {
    return (
      <article
        className={`card ${isSelected ? 'card--active' : ''}`}
        ref={cardRef}
        onClick={handleClick}
        style={{
          background: `url(${getAbsoluteImagePath(image)})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: "12.5rem",
          ...(variant === 'photo' && { width: "100%" })
        }}
      >
        <h2 className={`action-text ${showActionText ? 'action-text--visible' : ''}`}>
          Пройдите в фотозону
        </h2>

        <div
          className="selected-label"
          onClick={handleSelectClick}
        >
          <svg viewBox="0 0 120 20" width="130" height="30">
            {isSelected ? (
              <use href="#icon-success"></use>
            ) : (
              <use href="#icon-select"></use>
            )}
          </svg>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`card ${isSelected ? 'card--active' : ''}`}
      ref={cardRef}
      onClick={handleClick}>
      <h2 className={`action-text ${showActionText ? 'action-text--visible' : ''}`}>
        Пройдите в фотозону
      </h2>
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
          <div
            className="selected-label"
            onClick={handleSelectClick}>
            <svg viewBox="0 0 120 20" width="130" height="30">
              {isSelected ? (
                <use href="#icon-success"></use>
              ) : (
                <use href="#icon-select"></use>
              )}
            </svg>
          </div>

        </div>
      </div>
    </article>
  );
};

export default Card;