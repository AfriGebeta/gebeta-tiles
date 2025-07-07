import React, { useState } from "react";
import { examples } from "src/examples/examplesList";
import "./App.css";

function App() {
  const [selected, setSelected] = useState(null);

  if (selected !== null) {
    const ExampleComponent = examples[selected].component;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <button onClick={() => setSelected(null)} style={{ position: "absolute", top: "20px", left: "20px", zIndex: 999, marginBottom: 16, background: '#f5f5f5', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontWeight: 500 }}>← Back to all examples</button>
        <ExampleComponent />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 0 }}>
      <header style={{ padding: '32px', textAlign: 'center', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <h1 style={{ margin: 0, fontSize: 32, letterSpacing: -1 }}>Gebeta Maps React SDK Examples</h1>
        <p style={{ color: '#555', margin: '12px 0 0 0', fontSize: 18 }}>
          Explore interactive examples of Gebeta Maps features. Click a card to view a live demo.
        </p>
      </header>
      <main style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, padding: 40, maxWidth: 1200, margin: '0 auto' }}>
        {examples.map((ex, i) => (
          <div
            key={ex.title}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 28,
              background: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              cursor: "pointer",
              transition: "box-shadow 0.2s, transform 0.2s",
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}
            onClick={() => setSelected(i)}
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: 22 }}>{ex.title}</h3>
            <p style={{ color: '#666', margin: 0, fontSize: 16 }}>{ex.description}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;