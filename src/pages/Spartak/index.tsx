
import Header from '@/components/Header';
import '@/styles/main.scss';
import React from 'react';

const App: React.FC = () => {
  return (
    <div className='wrapper'>
      <Header title="Spartak site" />
      <main>
        Форма, которая отравляет данные ( М/Ж, Имя, номер очереди )
      </main>
    </div>
  );
};

export default App;