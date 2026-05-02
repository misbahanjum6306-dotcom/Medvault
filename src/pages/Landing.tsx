import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Activity, Mail, Lock, User as UserIcon, Chrome, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const Landing: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.onboarded) {
            navigate(userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
          } else {
            navigate('/onboarding');
          }
        } else {
          navigate('/onboarding');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          email,
          name,
          role,
          onboarded: false,
          createdAt: new Date()
        });
        navigate('/onboarding');
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth is not enabled in Firebase Console. Please use Google Sign-In for the demo.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.onboarded) {
          navigate(userData.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        // New Google user needs to pick a role
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          email: user.email,
          name: user.displayName || 'New User',
          role: role, // Use currently selected role toggle
          onboarded: false,
          createdAt: new Date()
        });
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Activity size={40} />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">MedVault</h1>
          <p className="mt-2 text-blue-100 italic font-medium">Your Health, Your Privacy, Your Vault.</p>
        </div>

        <div className="p-8">
          {/* Role Toggle for Signup/Google */}
          <div className="mb-6 space-y-3">
             <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Join As</label>
             <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all",
                    role === 'patient' ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                  )}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-3 px-4 text-sm font-bold transition-all",
                    role === 'doctor' ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                  )}
                >
                  Doctor
                </button>
             </div>
          </div>

          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-bold transition-all",
                isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-bold transition-all",
                !isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 ring-1 ring-red-100">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            <Chrome size={20} className="text-blue-500" />
            Google Academy Login
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-center text-xs text-gray-400">
        Demo Credentials (if enabled): patient@test.com / 123456
      </p>
    </div>
  );
};

export default Landing;
