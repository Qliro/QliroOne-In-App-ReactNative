import React from 'react';
import { Navigation } from './Navigation';
import { StoreProvider } from './Store';

const App = () => {
  return (
    <StoreProvider>
      <Navigation />
    </StoreProvider>
  );
};

export default App;
