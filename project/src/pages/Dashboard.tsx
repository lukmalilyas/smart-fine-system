import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - replace with actual API data
const detectedVehicles = [
  { id: '1', plate: 'ABC123', vehicle: 'Toyota Camry' },
  // { id: '2', plate: 'XYZ789', vehicle: 'Honda Civic' },
  // { id: '3', plate: 'DEF456', vehicle: 'Tesla Model 3' },
];

function Dashboard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Detected Vehicles</h1>
          <p className="text-zinc-400">Recent detections and their details</p>
        </motion.div>

        <div className="space-y-4">
          {detectedVehicles.map((vehicle, index) => (
            <motion.button
              key={vehicle.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/vehicle/${vehicle.id}`)}
              className="w-full p-6 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center space-x-4 transition-all hover:bg-zinc-800"
            >
              <div className="p-3 bg-zinc-800 rounded-2xl">
                <Car size={24} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium">{vehicle.vehicle}</h3>
                <p className="text-zinc-400">{vehicle.plate}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Dashboard;