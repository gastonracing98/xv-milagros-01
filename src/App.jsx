import React from 'react';
import Hero from './components/Hero';
import config from './data/eventConfig.json';
import counter from './components/Counter.jsx'
import Counter from './components/Counter.jsx';
function App() {
  return (
    <main className="font-sans">
      <Hero />
      <Counter />
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Te espero para celebrar</h2>
        <p className="text-gray-600">En el {config.ubicacion.salon}</p>
      </section>
    </main>
  );
}

export default App;