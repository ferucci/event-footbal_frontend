import type { CardProps } from '@/types';
import React, { useRef } from 'react';

interface ExtendedCardProps extends CardProps {
  onSelectButtonClick: () => void;
  isSelected: boolean;
  isSelectButtonDisabled: boolean;
  isAnimating: boolean;
  showActionText: boolean;
}

const CardPhoto: React.FC<ExtendedCardProps> = (cardData: ExtendedCardProps) => {
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
    showActionText
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

  // Функция для преобразования относительного пути в абсолютный
  const getAbsoluteImagePath = (imgPath: string) => {
    if (imgPath.startsWith('./')) {
      return imgPath.replace('./', '/');
    }
    return imgPath;
  };

  return (
    <article
      className={`card ${isSelected ? 'card--active' : ''}`}
      ref={cardRef}
      onClick={handleClick}
      style={{
        background: `url(${getAbsoluteImagePath(image)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: "100%",
        minHeight: "12.5rem"
      }}
    >
      <h2 className={`action-text ${showActionText ? 'action-text--visible' : ''}`}>
        Пройдите в фотозону
      </h2>

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

    </article>
  );
};

export default CardPhoto;