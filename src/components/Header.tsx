import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__logo">
          <img src="./images/VU_logotitle.png" alt={title} />
        </div>
      </div>
    </header>
  );
};

export default Header;