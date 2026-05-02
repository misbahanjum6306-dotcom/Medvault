import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (isOpen) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render((decodedText) => {
        // Handle success
        onScanSuccess(decodedText);
        scanner?.clear().then(() => onClose()).catch(e => console.error(e));
      }, (error) => {
        // Handle error (mostly ignores it as it's noisy)
        // console.warn(error);
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner on unmount", e));
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Camera size={20} />
                <h3 className="font-bold uppercase tracking-widest text-xs">Scan Patient QR</h3>
              </div>
              <button 
                onClick={onClose}
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div id="qr-reader" className="overflow-hidden rounded-2xl border-none"></div>
              <p className="mt-4 text-center text-xs text-gray-500 font-medium">
                Align the patient's QR code within the frame to automatically scan and open their records.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QRScannerModal;
