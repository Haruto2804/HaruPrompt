import React, { useState, useEffect } from 'react';
import { Heart, X, Copy, CheckCircle2 } from 'lucide-react';

const DonateWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const bankInfo = {
    bankName: "Tên Ngân Hàng",
    accountNumber: "0123456789",
    accountName: "NGUYEN VAN A"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bankInfo.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-110 transition-all duration-300"
        aria-label="Donate"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        <Heart className="w-6 h-6 fill-current animate-pulse" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden transform transition-all">
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Area with Gradient */}
            <div className="pt-10 pb-6 px-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-pink-500/20 to-transparent"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20 rotate-3">
                  <Heart className="w-8 h-8 text-white fill-current" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Ủng Hộ Tác Giả</h2>
                <p className="text-zinc-400 text-sm">
                  Nếu bạn thấy project này hữu ích, hãy mời mình một ly cafe nhé! Sự ủng hộ của bạn là động lực rất lớn.
                </p>
              </div>
            </div>

            {/* QR Code Area */}
            <div className="px-8 pb-4">
              <div className="bg-white p-3 rounded-2xl mx-auto w-48 h-48 mb-6 shadow-inner relative group">
                <img 
                  src="/qr-code.png" 
                  alt="QR Code Donate" 
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/200?text=Thay+qr-code.png+vao+thu+muc+public';
                  }}
                />
              </div>

              {/* Bank Info */}
              <div className="bg-zinc-800/50 rounded-2xl p-4 border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Ngân hàng</span>
                  <span className="font-semibold text-white">{bankInfo.bankName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Chủ tài khoản</span>
                  <span className="font-semibold text-white">{bankInfo.accountName}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                  <span className="text-zinc-400">Số tài khoản</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 text-base">
                      {bankInfo.accountNumber}
                    </span>
                    <button 
                      onClick={handleCopy}
                      className="text-zinc-400 hover:text-white transition-colors p-1"
                      title="Copy số tài khoản"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-zinc-900/50 border-t border-white/5 text-center">
              <p className="text-xs text-zinc-500">Cảm ơn bạn rất nhiều! ❤️</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DonateWidget;
