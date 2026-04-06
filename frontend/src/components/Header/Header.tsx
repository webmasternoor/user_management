import React from 'react';

const Header: React.FC = () => {
  return (
    <header>
      <nav>
        <a href="/">Home</a> | <a href="/about">About</a>
      </nav>
    </header>
  );
}

export default Header;