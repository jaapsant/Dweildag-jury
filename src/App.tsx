import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScoreProvider } from './context/ScoreContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import JuryPage from './pages/JuryPage';
import JuryScoring from './pages/JuryScoring';
import ScoresPage from './pages/ScoresPage';
import TopBandsPage from './pages/TopBandsPage';

function App() {
  return (
    <ScoreProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Header />
          <div className="flex-1 pb-16 md:pb-0"> {/* Add padding to bottom for mobile navigation */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jury" element={<JuryPage />} />
              <Route path="/jury/:juryId" element={<JuryScoring />} />
              <Route path="/scores" element={<ScoresPage />} />
              <Route path="/top-bands" element={<TopBandsPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </ScoreProvider>
  );
}

export default App;