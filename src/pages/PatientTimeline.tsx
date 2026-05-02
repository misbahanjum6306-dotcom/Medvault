import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import { MedicalRecord } from '../types';
import { FileText, ExternalLink, ChevronLeft, Calendar, FileType } from 'lucide-react';
import { cn } from '../lib/utils';

const PatientTimeline: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'records'),
      where('patientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MedicalRecord[];
      setRecords(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-lg px-4 pt-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Timeline</h1>
          <p className="mt-2 text-gray-500">A chronological history of your medical records.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-lg ring-1 ring-gray-100">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No records found</h3>
            <p className="mt-2 text-gray-500">Start by uploading your first prescription or report.</p>
            <button 
              onClick={() => navigate('/patient/upload')}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              Upload Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div 
                key={record.id}
                className="group relative flex items-center gap-4 overflow-hidden rounded-3xl bg-white p-5 shadow-lg ring-1 ring-gray-100 transition-all hover:bg-gray-50 active:scale-[0.99]"
              >
                <div className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                  record.type === 'prescription' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                )}>
                  <FileType size={28} />
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      record.type === 'prescription' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    )}>
                      {record.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      {formatDate(record.createdAt)}
                    </span>
                  </div>
                  <h4 className="mt-1 truncate font-bold text-gray-900" title={record.fileName}>
                    {record.fileName}
                  </h4>
                </div>

                <a 
                  href={record.fileURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-blue-600 hover:text-white"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientTimeline;
