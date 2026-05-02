import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';
import ToggleSwitch from '../components/ToggleSwitch';
import RemindersList from '../components/RemindersList';
import { Upload, Clock, User, Shield, ShieldOff, Heart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const PatientDashboard: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();

  const handleToggleSharing = async (enabled: boolean) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { isSharingEnabled: enabled });
      await refreshProfile();
    } catch (error) {
      console.error("Error toggling sharing:", error);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-900">
      <Navbar />
      
      <main className="mx-auto max-w-lg px-4 pt-8 space-y-6">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Health Hub</h2>
            <h1 className="text-4xl font-black tracking-tight text-gray-950">{profile.name.split(' ')[0]}</h1>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white shadow-xl shadow-blue-500/10 ring-1 ring-gray-100 ring-gray-100">
             <Heart size={28} className="text-red-500 fill-red-500" />
          </div>
        </motion.header>

        {/* Vital Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link 
            to="/patient/upload"
            className="flex flex-col items-center gap-3 rounded-[2.5rem] bg-blue-600 p-8 text-white shadow-2xl shadow-blue-600/30 transition-all hover:translate-y-[-4px] active:scale-95"
            id="upload-record-link"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/20 backdrop-blur-sm">
              <Upload size={28} strokeWidth={2.5} />
            </div>
            <span className="font-black text-sm uppercase tracking-widest">Upload</span>
          </Link>
          <Link 
            to="/patient/timeline"
            className="flex flex-col items-center gap-3 rounded-[2.5rem] bg-white p-8 text-gray-950 shadow-2xl shadow-gray-200/50 ring-1 ring-gray-100 transition-all hover:translate-y-[-4px] active:scale-95"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gray-50 text-blue-600">
              <Clock size={28} strokeWidth={2.5} />
            </div>
            <span className="font-black text-sm uppercase tracking-widest">Timeline</span>
          </Link>
        </div>

        {/* QR Code Section */}
        <section className="overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-gray-200/50 ring-1 ring-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">Vault Access</h3>
            <div className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${profile.isSharingEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {profile.isSharingEnabled ? <Shield size={14} /> : <ShieldOff size={14} />}
              {profile.isSharingEnabled ? 'Active' : 'Locked'}
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-4 bg-gray-50/50 rounded-3xl mb-6">
            <div className="rounded-[2.5rem] border-[12px] border-white bg-white p-2 shadow-2xl shadow-blue-500/10">
              <QRCodeSVG 
                value={`${window.location.origin}/doctor/patient/${profile.id}`}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="mt-8 px-4 text-center text-xs font-medium text-gray-500 leading-relaxed">
              Show this QR to your medical provider. Your records are only accessible when sharing is ON.
            </p>
          </div>

          <div className="pt-2">
            <ToggleSwitch 
              id="privacy-toggle"
              label="Secure Data Sharing" 
              enabled={profile.isSharingEnabled || false} 
              onChange={handleToggleSharing}
            />
          </div>
        </section>

        {/* Reminders */}
        <section className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-gray-200/50 ring-1 ring-gray-100">
           <RemindersList />
        </section>

        {/* Profile Stats */}
        <section className="rounded-[2.5rem] bg-blue-900 p-8 text-white shadow-2xl shadow-blue-900/40">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight">Health Profile</h3>
            <User size={20} className="opacity-50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
               <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-1">Blood Type</p>
               <p className="text-xl font-black">{profile.bloodGroup}</p>
             </div>
             <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
               <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-1">Status</p>
               <p className="text-xl font-black">Verified</p>
             </div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
             <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Vault ID</p>
             <p className="mt-1 font-mono text-xs break-all opacity-80">{profile.id}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PatientDashboard;
