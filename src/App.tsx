// PLTS Training Tools - Main Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Calculators } from './pages/Calculators';
import { ComponentDatabase } from './pages/ComponentDatabase';
import { ProjectPortfolio } from './pages/ProjectPortfolio';
import { Quiz } from './pages/Quiz';
import { Settings } from './pages/Settings';
import { History } from './pages/History';
import { LearningMaterials } from './pages/LearningMaterials';

// Individual Calculator Pages
import { StringConfigCalculator } from './components/calculators/StringConfigCalculator';
import { ROICalculator } from './components/calculators/ROICalculator';
import { BatterySizingCalculator } from './components/calculators/BatterySizingCalculator';
import { CableSizingCalculator } from './components/calculators/CableSizingCalculator';
import { LoadProfileCalculator } from './components/calculators/LoadProfileCalculator';
import { MountingCalculator } from './components/calculators/MountingCalculator';
import { PSHMap } from './components/calculators/PSHMap';
import { SafetyChecklist } from './components/calculators/SafetyChecklist';
import { Troubleshooting } from './components/calculators/Troubleshooting';
import { QuoteGenerator } from './components/calculators/QuoteGenerator';
import { PVSizingCalculator } from './components/calculators/PVSizingCalculator';
import { UserRegistration } from './components/auth/UserRegistration';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('plts_user_profile');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!user) {
    return <UserRegistration onComplete={setUser} />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tools" element={<Calculators />} />
          <Route path="/calculators/string-config" element={<StringConfigCalculator />} />
          <Route path="/calculators/roi" element={<ROICalculator />} />
          <Route path="/calculators/battery-sizing" element={<BatterySizingCalculator />} />
          <Route path="/calculators/cable-sizing" element={<CableSizingCalculator />} />
          <Route path="/calculators/load-profile" element={<LoadProfileCalculator />} />
          <Route path="/calculators/mounting" element={<MountingCalculator />} />
          <Route path="/calculators/psh" element={<PSHMap />} />
          <Route path="/calculators/safety" element={<SafetyChecklist />} />
          <Route path="/calculators/troubleshooting" element={<Troubleshooting />} />
          <Route path="/calculators/quote" element={<QuoteGenerator />} />
          <Route path="/calculators/pv-sizing" element={<PVSizingCalculator />} />
          
          <Route path="/database" element={<ComponentDatabase />} />
          <Route path="/projects" element={<ProjectPortfolio />} />
          <Route path="/history" element={<History />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/materi" element={<LearningMaterials />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
