import CardsGrid from '@/components/CardsGrid';
import Header from '@/components/Header';
import '@/styles/main.scss';
import React from 'react';

const App: React.FC = () => {
  return (
    <div className='wrapper'>
      <Header title="Spartak site" />
      <main>
        <CardsGrid />
      </main>
    </div>
  );
};

export default App;