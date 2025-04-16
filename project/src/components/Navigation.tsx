import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, LayoutDashboard, Mic } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-lg border-t border-zinc-800">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${
              location.pathname === '/' ? 'text-white' : 'text-zinc-500'
            }`}
          >
            <Camera size={24} />
            <span className="text-xs mt-1">Scanner</span>
          </button>

          <button
            onClick={() => navigate('/record-audio')}
            className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${
              location.pathname === '/record-audio' ? 'text-white' : 'text-zinc-500'
            }`}
          >
            <Mic size={24} />
            <span className="text-xs mt-1">Recorder</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center p-3 rounded-2xl transition-colors ${
              location.pathname === '/dashboard' ? 'text-white' : 'text-zinc-500'
            }`}
          >
            <LayoutDashboard size={24} />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navigation;
