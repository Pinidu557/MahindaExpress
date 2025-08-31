// components/ui/Modal.jsx
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-slate-900 p-6 rounded-xl w-[90%] max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
