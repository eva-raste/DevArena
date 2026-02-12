"use client"

import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X 
} from "lucide-react";

const toastStyles = {
  success: {
    container: "bg-green-50 border-green-200 text-green-900",
    icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-900",
    icon: <Info className="w-6 h-6 text-blue-500" />,
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-900",
    icon: <AlertCircle className="w-6 h-6 text-red-500" />,
  },
};

export const AppToast = ({ toast, onClose }) => {
  if (!toast) return null;

  const style = toastStyles[toast.type] || toastStyles.info;

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-start gap-4 min-w-[320px] max-w-md p-4 rounded-2xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 ${style.container}`}>

      {/* Icon Section */}
      <div className="flex-shrink-0 mt-0.5">
        {style.icon}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col gap-1">
        <h3 className="font-bold text-[15px] leading-none">
          {toast.title || style.title}
        </h3>
        <p className="text-sm opacity-90 leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4 opacity-50 hover:opacity-100" />
      </button>
    </div>
  );
};