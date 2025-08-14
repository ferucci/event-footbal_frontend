# Файл `Card.tsx` - Документация

## Назначение
Компонент `Card` отображает индивидуальную карточку игрока и обрабатывает пользовательские взаимодействия.

## Структура компонента

### Интерфейс пропсов
```typescript
interface CardProps {
  id: number;
  name: string;
  number: string;
  position: string;
  height: string;
  weight: string;
  rate: number;
  image: string;
  country: string;
  onClick: (cardRef: React.RefObject<HTMLDivElement>) => void;
}
Описание полей:

id - уникальный идентификатор карточки

name - имя игрока

number - игровой номер

position - амплуа игрока

height/weight - физические параметры

rate - рейтинг игрока (число)

image - путь к изображению игрока

country - код страны (для флага)

onClick - обработчик клика

Основная логика компонента
Создание ref
typescript
const cardRef = useRef<HTMLDivElement>(null);
Назначение:
Хранит ссылку на DOM-элемент карточки для:

Анимации при клике

Позиционирования

Взаимодействия с CardManager

Обработчик клика
typescript
const handleClick = () => {
  if (cardRef.current) {
    const typedRef: React.RefObject<HTMLDivElement> = {
      current: cardRef.current
    };
    onClick(typedRef);
  }
};
Особенности:

Проверяет существование элемента

Создает новый ref-объект с правильным типом

Вызывает переданный обработчик с ref карточки

Структура рендеринга
Верхняя часть карточки
typescript
<div className="card__top">
  <div className="card__level">
    <img src="./src/assets/images/OHK_Dynamo_logo.svg.png" alt="Эмблема команды"/>
    <img src={country} alt="Флаг страны"/>
    <span className="rate">{rate}</span>
  </div>
  <div className="card__image">
    <img src={image} alt={`Игрок ${name}`}/>
  </div>
</div>
Элементы:

Логотип команды (фиксированный)

Флаг страны (из пропса)

Рейтинг игрока

Фото игрока

Нижняя часть карточки
typescript
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
Блоки информации:

Имя игрока (заголовок)

Параметры:

Номер и рост

Вес

Позиция (статус)

Индикатор выбора (скрыт по умолчанию)

Особенности реализации
Типизация
Строгая типизация всех пропсов

Явное указание типа для useRef

Кастомный тип для обработчика клика

Доступность
Все изображения имеют alt-тексты

Семантическая верстка (article, h3)

Производительность
Использование useRef вместо state для DOM-элементов

Мемоизированный обработчик клика

Пример использования
typescript
<Card
  id={1}
  name="Лунёв"
  number="01"
  position="Вратарь"
  height="190 см"
  weight="82 кг"
  rate={85}
  image="01-Лунев.png"
  country="russia"
  onClick={handleCardClick}
/>
Стилизация
Компонент использует CSS-классы:

.card - базовая стилизация

.card__top - верхний блок с изображениями

.card__bottom - информационный блок

.selected-label - индикатор выбора (управляется через CardManager)

Анимации реализованы через CSS на основе классов:

.card.active - состояние при активации

css
.card.active {
  position: fixed;
  z-index: 100;
  animation: cardFlyOut 0.3s ease forwards;
}