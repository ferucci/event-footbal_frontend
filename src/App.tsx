import React from 'react';
import CardsGrid from './components/CardsGrid';
import Header from './components/Header';
import './styles/main.scss';

const App: React.FC = () => {
  return (
    <div className='wrapper'>
      <Header />
      <main>
        <CardsGrid />
      </main>
    </div>
  );
};

export default App;