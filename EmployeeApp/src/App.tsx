import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import VehicleDetails from './pages/VehicleDetails';
import AudioRecorder from './pages/AudioRecorder'; // ✅ Import your new component
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <div className="pb-20"> {/* Add padding for mobile navigation */}
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicle/:id" element={<VehicleDetails />} />
            <Route path="/record-audio" element={<AudioRecorder />} /> {/* ✅ Add this */}
          </Routes>
        </div>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
