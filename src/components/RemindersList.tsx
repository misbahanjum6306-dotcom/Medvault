import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Bell, Plus, X, CheckCircle, Circle } from 'lucide-react';
import { Reminder } from '../types';
import { cn } from '../lib/utils';

const RemindersList: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [newReminder, setNewReminder] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleAdd = async () => {
    if (!user || !profile || !newReminder) return;

    const reminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      text: newReminder,
      time: newTime || 'Anytime',
      completed: false
    };

    const currentReminders = profile.reminders || [];
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        reminders: [...currentReminders, reminder]
      });
      setNewReminder('');
      setNewTime('');
      await refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id: string) => {
    if (!user || !profile) return;
    const updatedReminders = (profile.reminders || []).map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        reminders: updatedReminders
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id: string) => {
    if (!user || !profile) return;
    const updatedReminders = (profile.reminders || []).filter(r => r.id !== id);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        reminders: updatedReminders
      });
      await refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Health Reminders</h3>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
           {(profile?.reminders || []).filter(r => !r.completed).length} Pending
        </span>
      </div>

      <div className="space-y-2">
        {(profile?.reminders || []).map(r => (
          <div 
            key={r.id} 
            className={cn(
              "flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all",
              r.completed && "opacity-50"
            )}
          >
            <div className="flex items-center gap-3">
              <button onClick={() => handleToggle(r.id)} className="text-blue-600">
                {r.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
              </button>
              <div>
                <p className={cn("text-sm font-semibold", r.completed && "line-through text-gray-400")}>{r.text}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{r.time}</p>
              </div>
            </div>
            <button 
              onClick={() => handleRemove(r.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
        <div className="flex flex-col gap-2">
          <input 
            type="text" 
            placeholder="Add medicine or checkup..."
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. 8:00 AM"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button 
              onClick={handleAdd}
              className="rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700 active:scale-95 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersList;
