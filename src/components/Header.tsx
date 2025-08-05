import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__logo">
          <img src="./images/logo.svg" alt="logo" />
        </div>
      </div>
    </header>
  );
};

export default Header;