import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { LogOut, User, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  if (!profile) return null;

  return (
    <nav className="sticky top-0 z-[1001] border-b border-gray-100 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to={profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Activity size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-950 uppercase italic">MedVault</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-0.5">{profile.role}</span>
            <span className="text-sm font-bold text-gray-900">{profile.name.split(' ')[0]}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-white transition-all hover:bg-black active:scale-90"
            title="Logout"
            id="logout-button"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
