import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import Navbar from '../components/Navbar';
import { Upload, FileText, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const PatientUpload: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    setError('');

    try {
      const storageRef = ref(storage, `records/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          console.error("Upload error:", error);
          setError('Failed to upload file. Please try again.');
          setLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, 'records'), {
            patientId: user.uid,
            fileURL: downloadURL,
            fileName: file.name,
            type: type,
            createdAt: serverTimestamp()
          });

          setLoading(false);
          navigate('/patient/timeline');
        }
      );
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Upload Record</h1>
          <p className="mt-2 text-gray-500">Securely store your medical prescriptions and reports.</p>
        </header>

        <form onSubmit={handleUpload} className="space-y-8 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          {/* File Picker */}
          <div className="space-y-3">
             <label className="block text-sm font-semibold uppercase tracking-wider text-gray-400">Select File</label>
             <div className={cn(
               "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all",
               file ? "border-green-200 bg-green-50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
             )}>
               <input
                 type="file"
                 accept="image/*,application/pdf"
                 onChange={handleFileChange}
                 className="absolute inset-0 z-10 cursor-pointer opacity-0"
                 id="file-input"
               />
               {file ? (
                 <>
                   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                     <CheckCircle2 size={24} />
                   </div>
                   <p className="mt-4 text-center font-medium text-gray-900">{file.name}</p>
                   <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                 </>
               ) : (
                 <>
                   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                     <Upload size={24} />
                   </div>
                   <p className="mt-4 text-center font-medium text-gray-900">Tap to upload PDF or Image</p>
                   <p className="text-xs text-gray-500">Max size 10MB</p>
                 </>
               )}
             </div>
          </div>

          {/* Record Type */}
          <div className="space-y-3">
             <label className="block text-sm font-semibold uppercase tracking-wider text-gray-400">Record Type</label>
             <div className="flex gap-4">
               <button
                 type="button"
                 onClick={() => setType('prescription')}
                 className={cn(
                   "flex flex-1 items-center justify-center gap-2 rounded-xl py-4 transition-all active:scale-[0.98]",
                   type === 'prescription' ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                 )}
               >
                 <FileText size={18} />
                 <span className="font-semibold">Prescription</span>
               </button>
               <button
                 type="button"
                 onClick={() => setType('report')}
                 className={cn(
                   "flex flex-1 items-center justify-center gap-2 rounded-xl py-4 transition-all active:scale-[0.98]",
                   type === 'report' ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                 )}
               >
                 <FileText size={18} />
                 <span className="font-semibold">Report</span>
               </button>
             </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-gray-400">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Securely Upload'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default PatientUpload;
