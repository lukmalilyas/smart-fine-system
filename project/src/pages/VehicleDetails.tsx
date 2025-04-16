import { useParams, useNavigate } from 'react-router-dom';
import { Car, Calendar, Gauge, User, AlertTriangle, Shield, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - replace with actual API data
const vehicleData = {
  '1': {
    vehicle: 'Toyota Camry',
    plate: 'ABC123',
    year: '2020',
    speed: '145 km/h',
    owner: 'John Doe',
    violations: ['Speeding', 'Red light violation'],
    insurance: {
      provider: 'SafeCar Insurance',
      status: 'Active',
      expiryDate: '2025-12-31'
    }
  }
};

function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = vehicleData[id as keyof typeof vehicleData];

  if (!data) return <div>Vehicle not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-md mx-auto relative">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="absolute -left-2 -top-2 p-3 bg-zinc-900/80 backdrop-blur-lg rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors z-10"
        >
          <ChevronLeft size={24} />
        </motion.button>

        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block p-4 bg-zinc-800 rounded-2xl mb-4"
            >
              <Car size={32} />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold"
            >
              {data.vehicle}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-zinc-400"
            >
              {data.plate}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-4 p-4 bg-zinc-800/50 rounded-2xl"
            >
              <Calendar size={20} className="text-zinc-400" />
              <div>
                <p className="text-sm text-zinc-400">Manufacture Year</p>
                <p className="font-medium">{data.year}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-4 p-4 bg-zinc-800/50 rounded-2xl"
            >
              <Gauge size={20} className="text-zinc-400" />
              <div>
                <p className="text-sm text-zinc-400">Detected Speed</p>
                <p className="font-medium">{data.speed}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-4 p-4 bg-zinc-800/50 rounded-2xl"
            >
              <User size={20} className="text-zinc-400" />
              <div>
                <p className="text-sm text-zinc-400">Owner</p>
                <p className="font-medium">{data.owner}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-zinc-800/50 rounded-2xl"
            >
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle size={20} className="text-zinc-400" />
                <h3 className="font-medium">Traffic Violations</h3>
              </div>
              <div className="space-y-2">
                {data.violations.map((violation, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="text-sm text-zinc-400 pl-7"
                  >
                    • {violation}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-zinc-800/50 rounded-2xl"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Shield size={20} className="text-zinc-400" />
                <h3 className="font-medium">Insurance Details</h3>
              </div>
              <div className="space-y-2 pl-7">
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-sm"
                >
                  <span className="text-zinc-400">Provider:</span> {data.insurance.provider}
                </motion.p>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm"
                >
                  <span className="text-zinc-400">Status:</span>{' '}
                  <span className="text-green-400">{data.insurance.status}</span>
                </motion.p>
                <motion.p
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-sm"
                >
                  <span className="text-zinc-400">Expires:</span> {data.insurance.expiryDate}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default VehicleDetails;