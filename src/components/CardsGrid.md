# Файл `CardsGrid.tsx` - Документация

## Назначение
Компонент `CardsGrid` отвечает за:
- Отображение сетки карточек
- Интеграцию логики управления карточками
- Передачу данных в дочерние компоненты `Card`

## Структура компонента

### Импорты
```typescript
import React, { useRef } from 'react';
import cardsData from '../data/cards.json';
import Card from './Card';
import { useCardManager } from './CardManager';

Назначение:

useRef - для получения ссылки на DOM-элемент

cardsData - данные карточек из JSON-файла

Card - компонент отдельной карточки

useCardManager - хук управления логикой карточек

Основной компонент
typescript
const CardsGrid: React.FC = () => {
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const { handleCardClick, overlayRef } = useCardManager({ cardsContainerRef });

  return (
    <section className="cards" ref={cardsContainerRef}>
      {/* Рендер карточек */}
      <div className="overlay" ref={overlayRef}></div>
    </section>
  );
};
Ключевые элементы:

cardsContainerRef

Тип: RefObject<HTMLDivElement>

Назначение: Ссылка на контейнер карточек для расчета позиций

useCardManager

Получаемые методы:

handleCardClick - обработчик клика по карточке

overlayRef - ссылка на элемент затемнения

Рендер карточек
typescript
{cardsData.map((card) => (
  <Card
    key={card.id}
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
Особенности:

Использует map для преобразования данных в компоненты

Каждой карточке передается:

Уникальный key по id

Все необходимые данные из JSON

Обработчик клика onClick

Элемент затемнения
typescript
<div className="overlay" ref={overlayRef}></div>
Назначение:

Создает полупрозрачный overlay

Управляется через CardManager

Отображается при активной карточке

Принципы работы
Однонаправленный поток данных:

Данные поступают из cards.json

Логика управления из useCardManager

Отображение через компонент Card

Оптимизация рендера:

Каждая карточка получает стабильный key

Логика обработки кликов вынесена в хук

Типизация:

Строгая типизация пропсов

Явное указание типов для refs

Пример использования данных
Структура cards.json:

json
{
  "id": 1,
  "name": "Лунёв",
  "number": "01",
  "position": "Вратарь",
  "height": "190 см",
  "weight": "82 кг",
  "rate": 85,
  "image": "01-Лунев.png",
  "country": "russia"
}