import React from "react";
import Hero from "./components/Hero";
import Counter from "./components/Counter";
import Location from "./components/Location";
import Timeline from "./components/Timeline.jsx";
import RsvpForm from "./components/RsvpForm.jsx";

function App() {
  return (
    <main className="min-h-screen bg-tiana-cream font-sans selection:bg-tiana-mint selection:text-tiana-dark">
      {/* 1. Portada + Fecha + Canción */}
      <Hero />

      {/* 2. Contador UTC */}
      <Counter />

      {/* 3. Ubicación + Google Maps + Cómo Llegar */}
      <Location />

      {/* 4. Cronograma de la noche */}
      <Timeline />

      {/* 5. Formulario de Confirmación */}
      <RsvpForm />
    </main>
  );
}

export default App;
