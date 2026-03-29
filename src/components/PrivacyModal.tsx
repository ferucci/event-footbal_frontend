import React from 'react';

interface PrivacyModalProps {
  isOpen: boolean;
  playerName: string;
  onAccept: () => void;
  onReject: () => void;
  isLoading: boolean;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  playerName,
  onAccept,
  onReject,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="privacy-modal-overlay">
      <div className="privacy-modal">
        <h2 className="privacy-modal__title">
          Политика конфиденциальности
        </h2>

        <div className="privacy-modal__content">
          <p className="privacy-modal__info">
            Выбирая игрока `{playerName}`, вы соглашаетесь с условиями обработки ваших данных:
          </p>

          <div className="privacy-modal__scrollable">
            <h3>
              Настоящая Политика конфиденциальности описывает, как мы собираем, используем и защищаем вашу личную информацию.
            </h3>
            <h4>1. Собираемая информация</h4>
            <p>
              Мы можем собирать информацию, которую вы предоставляете напрямую (например, имя, контакты), а также данные об использовании наших услуг (например, IP-адрес, данные cookie).
            </p>

            <h4>2. Цели использования</h4>
            <span>              Собранная информация используется для:</span>
            <ul>

              <li>Предоставления и улучшения наших услуг.</li>
              <li>Обратной связи и ответа на ваши запросы.</li>
              <li>Обеспечения безопасности и соблюдения законодательства.</li>
            </ul>

            <h4>3. Конфиденциальность и защита</h4>
            <p>
              Мы принимаем разумные меры для защиты ваших данных от несанкционированного доступа или разглашения. Мы не передаем вашу личную информацию третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.
            </p>
            <h4>
              4. Ваши права
            </h4>
            <p>
              Вы имеете право запросить доступ, исправление или удаление ваших личных данных, а также отозвать согласие на их обработку.
            </p>
            <h4>5. Изменения в политике</h4>
            <p>Мы оставляем за собой право вносить изменения в данную Политику. Актуальная версия всегда будет доступна на нашем сайте.</p>
            <h4>6. Контакты</h4>
            <p>
              По всем вопросам, касающимся конфиденциальности, обращайтесь по адресу: privacy@okko.ru
            </p>
            <p>
              Дата вступления в силу: <b>05.12.2025г.</b>
            </p>
          </div>

          <div className="privacy-modal__buttons">
            <button
              className="privacy-modal__button privacy-modal__button--reject"
              onClick={onReject}
              disabled={isLoading}
            >
              Отклонить
            </button>

            <button
              className="privacy-modal__button privacy-modal__button--accept"
              onClick={onAccept}
              disabled={isLoading}
            >
              {isLoading ? 'Обработка...' : 'Принять и выбрать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;