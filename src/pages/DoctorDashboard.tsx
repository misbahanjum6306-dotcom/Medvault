import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QRScannerModal from '../components/QRScannerModal';
import { Search, QrCode, User, ArrowRight, Activity, Camera, ScanLine } from 'lucide-react';
import { motion } from 'motion/react';

const DoctorDashboard: React.FC = () => {
  const [patientId, setPatientId] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      handlePatientId(patientId.trim());
    }
  };

  const handlePatientId = (id: string) => {
    // Extract ID if it's a full URL
    let finalId = id;
    if (id.includes('/doctor/patient/')) {
      finalId = id.split('/doctor/patient/').pop() || id;
    }
    navigate(`/doctor/patient/${finalId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <main className="mx-auto max-w-lg px-4 pt-8 space-y-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-blue-600 text-white shadow-2xl shadow-blue-600/30">
            <Activity size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-950">MedVault Pro</h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-blue-600">Provider Access Console</p>
        </motion.header>

        <div className="space-y-4">
           {/* Scan Action */}
           <button
            onClick={() => setIsScannerOpen(true)}
            className="flex w-full flex-col items-center gap-4 rounded-[2.5rem] bg-blue-600 px-8 py-12 text-white shadow-2xl shadow-blue-600/40 transition-all hover:translate-y-[-4px] active:scale-95"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-white text-blue-600 shadow-xl">
              <Camera size={36} strokeWidth={2.5} />
            </div>
            <div className="text-center">
               <h3 className="text-2xl font-black tracking-tight">Scan Patient QR</h3>
               <p className="text-sm font-medium text-blue-100 opacity-80">Instant profile & record access</p>
            </div>
          </button>

          {/* Manual Input */}
          <section className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-gray-200/50 ring-1 ring-gray-100">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Manual Entry</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Enter Patient Vault ID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-5 pl-12 pr-4 text-sm font-bold tracking-tight focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!patientId.trim()}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-950 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-black active:scale-95 disabled:opacity-50"
              >
                <span>Access Records</span>
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
              </button>
            </form>
          </section>
        </div>

        {/* Security Info */}
        <section className="rounded-[2rem] border-2 border-dashed border-gray-200 p-8 text-center">
           <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
             <ScanLine size={24} />
           </div>
           <h4 className="text-sm font-black tracking-tight text-gray-900">Zero-Trust Protocol</h4>
           <p className="mt-2 text-xs leading-relaxed text-gray-400 font-medium">
             Patients must explicitly have "Data Sharing" enabled on their dashboard for you to view records.
           </p>
        </section>

        <QRScannerModal 
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handlePatientId}
        />
      </main>
    </div>
  );
};

export default DoctorDashboard;
