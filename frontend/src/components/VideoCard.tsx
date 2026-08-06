import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(error => console.error("Autoplay prevented:", error));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div 
      className="relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group bg-zinc-900/80 border border-white/5 shadow-xl hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:border-indigo-500/30 transition-all duration-500 transform hover:-translate-y-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/video/${video.id}`)}
    >
      <img 
        src={video.thumbnailUrl} 
        alt="Thumbnail" 
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
      />
      
      <video
        ref={videoRef}
        src={video.videoUrl}
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
        <p className="text-white text-sm font-medium line-clamp-3 drop-shadow-md leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <span>
            {video.prompts && video.prompts.length > 0
              ? video.prompts.map(p => p.text).join(' ').substring(0, 100) + '...'
              : (video.promptText || '').replace(/<[^>]*>?/gm, '').substring(0, 100) + '...'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default VideoCard;
