import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Video } from '../types';

interface ModalContextType {
  isOpen: boolean;
  selectedVideo: Video | null;
  openModal: (video: Video) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const openModal = (video: Video) => {
    setSelectedVideo(video);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedVideo(null), 300); // Wait for transition
    document.body.style.overflow = 'auto';
  };

  return (
    <ModalContext.Provider value={{ isOpen, selectedVideo, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
