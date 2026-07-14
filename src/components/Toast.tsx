import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  type?: 'success' | 'error';
}

export default function Toast({ message, onClose, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0b1c30] text-white px-6 py-3.5 rounded-full shadow-2xl z-50 flex items-center gap-3 border border-white/10 max-w-[90vw]"
        >
          {type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#6bff8f] flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span className="font-sans font-bold text-sm text-gray-100">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
