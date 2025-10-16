import CardsGrid from '@/components/CardsGrid';
import Header from '@/components/Header';
import '@/styles/main.scss';
import React from 'react';

const App: React.FC = () => {
  return (
    <div className='wrapper'>
      <Header title="Dinamo site" />
      <main>
        <CardsGrid site="Dinamo" />
      </main>
    </div>
  );
};

export default App;