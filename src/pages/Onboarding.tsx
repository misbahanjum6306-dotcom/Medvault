import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { User, ClipboardList, MapPin, Hash, Droplets, GraduationCap } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    address: '',
    degree: ''
  });

  useEffect(() => {
    if (profile) {
      if (profile.onboarded) {
        navigate(profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
      } else {
        setFormData(prev => ({ ...prev, name: profile.name }));
      }
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);

    try {
      const docRef = doc(db, 'users', user.uid);
      const updates: any = {
        name: formData.name,
        address: formData.address,
        onboarded: true,
      };

      if (profile.role === 'patient') {
        updates.age = parseInt(formData.age);
        updates.gender = formData.gender;
        updates.bloodGroup = formData.bloodGroup;
        updates.isSharingEnabled = true;
      } else {
        updates.degree = formData.degree;
      }

      await updateDoc(docRef, updates);
      await refreshProfile();
      navigate(profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!profile) return null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-gray-500">We need a few more details to set up your account as a <span className="font-semibold text-blue-600 capitalize">{profile.role}</span>.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {profile.role === 'patient' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Age</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        name="age"
                        required
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Blood Group</label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>O+</option>
                      <option>O-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Medical Degree</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="degree"
                    required
                    placeholder="e.g. MBBS, MD, FRCS"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Full Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 text-gray-400" size={18} />
                <textarea
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Street address, City, ZIP"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Complete Onboarding'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
