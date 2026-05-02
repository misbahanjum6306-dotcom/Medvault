import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MedicalRecord, UserProfile } from '../types';
import Navbar from '../components/Navbar';
import { 
  ChevronLeft, 
  ShieldAlert, 
  User, 
  Calendar, 
  ExternalLink, 
  FileType, 
  Droplets, 
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

const DoctorPatientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchPatientData = async () => {
      try {
        const patientDoc = await getDoc(doc(db, 'users', id));
        if (patientDoc.exists()) {
          const patientData = patientDoc.data() as UserProfile;
          setPatient(patientData);

          if (patientData.isSharingEnabled) {
            const q = query(
              collection(db, 'records'),
              where('patientId', '==', id),
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
          } else {
            setLoading(false);
          }
        } else {
          setError('Patient not found');
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching patient:", err);
        setError('Error accessing patient data');
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <main className="mx-auto max-w-lg px-4 pt-8">
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="mb-6 flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ChevronLeft size={16} />
          Back to Search
        </button>

        {error ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-lg ring-1 ring-gray-100">
             <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
               <AlertCircle size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-900">{error}</h3>
             <p className="mt-2 text-gray-500">Please verify the Patient ID and try again.</p>
          </div>
        ) : patient && !patient.isSharingEnabled ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-lg ring-1 ring-gray-100">
             <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 text-orange-600">
               <ShieldAlert size={48} />
             </div>
             <h3 className="text-2xl font-bold text-gray-900">Access Restricted</h3>
             <p className="mt-2 text-gray-500">The patient has disabled records sharing. Please ask them to enable sharing from their dashboard.</p>
             
             <div className="mt-8 grid w-full grid-cols-2 gap-4 border-t border-gray-100 pt-8 text-left">
                <div>
                   <p className="text-xs font-bold uppercase text-gray-400">Patient Name</p>
                   <p className="font-semibold text-gray-900">{patient.name}</p>
                </div>
                <div>
                   <p className="text-xs font-bold uppercase text-gray-400">UID</p>
                   <p className="font-mono text-[10px] text-gray-900 truncate">{patient.id}</p>
                </div>
             </div>
          </div>
        ) : patient ? (
          <div className="space-y-8">
            {/* Patient Header Card */}
            <header className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl">
               <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <User size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{patient.name}</h1>
                    <p className="text-blue-100 italic">Medical Profile Verified</p>
                  </div>
               </div>

               <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-blue-100">Blood</p>
                    <p className="text-lg font-bold">{patient.bloodGroup}</p>
                  </div>
                  <div className="border-x border-white/10 text-center">
                    <p className="text-[10px] font-bold uppercase text-blue-100">Age</p>
                    <p className="text-lg font-bold">{patient.age}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase text-blue-100">Gender</p>
                    <p className="text-lg font-bold truncate">{patient.gender}</p>
                  </div>
               </div>
            </header>

            {/* Timeline */}
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                 <ClipboardList size={16} />
                 Record Timeline
              </h3>
              
              {records.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <p className="text-gray-400 italic">No records found for this patient.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div 
                      key={record.id}
                      className="group flex items-center gap-4 overflow-hidden rounded-3xl bg-white p-5 shadow-lg ring-1 ring-gray-100 transition-all hover:bg-gray-50"
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
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default DoctorPatientView;
