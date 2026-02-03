import React from 'react';
import './App.css';
//import FruitList from './components/Fruits';
import Clients from './components/Clients';


const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DHCP Client Viewer App</h1>
      </header>
      <main>
        <Clients />
      </main>
    </div>
  );
};

export default App;