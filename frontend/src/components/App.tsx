// src/App.tsx
import React from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import UserManagement from './User/UserManagement';

const App: React.FC = () => {
  return (
    <div>
      <Header />
      <main>
        <UserManagement />
      </main>
      <Footer />
    </div>
  );
}

export default App;