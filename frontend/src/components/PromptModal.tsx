import React, { useState, useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import { X, Copy, Check } from 'lucide-react';

const PromptModal: React.FC = () => {
  const { isOpen, selectedVideo, closeModal } = useModal();
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal && !isOpen) return null;

  const handleCopy = async () => {
    if (selectedVideo?.promptText) {
      await navigator.clipboard.writeText(selectedVideo.promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen ? 'opacity-100 backdrop-blur-md bg-black/80' : 'opacity-0 bg-transparent pointer-events-none'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        {/* Left side: Video */}
        <div className="w-full md:w-1/2 lg:w-3/5 bg-black relative flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 aspect-video md:aspect-auto">
          {selectedVideo && (
            <video
              src={selectedVideo.videoUrl}
              autoPlay
              loop
              controls
              playsInline
              className="w-full h-full object-contain max-h-[70vh]"
            />
          )}
          
          <button 
            onClick={closeModal}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors z-10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Right side: Prompt details */}
        <div className="w-full md:w-1/2 lg:w-2/5 p-6 flex flex-col max-h-[70vh]">
          <div className="flex justify-between items-center mb-6 hidden md:flex">
            <h2 className="text-lg font-semibold text-white">Prompt Details</h2>
            <button 
              onClick={closeModal}
              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap font-mono bg-black/30 p-4 rounded-xl border border-white/5">
              {selectedVideo?.promptText}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <button
              onClick={handleCopy}
              className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                copied 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              }`}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Prompt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
