import React, { useEffect, useState } from 'react';
import type { Video } from '../types';
import VideoCard from '../components/VideoCard';
import { Sparkles, Loader2 } from 'lucide-react';

// Mock data removed as per user request

const Home: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Fetch from backend API
        const response = await fetch('http://localhost:5000/api/videos');
        if (!response.ok) {
          throw new Error('Failed to fetch videos from backend');
        }

        const fetchedVideos = await response.json();
        setVideos(fetchedVideos);
      } catch (error) {
        console.warn("Error fetching data.", error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen flex flex-col pt-8 pb-20 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none opacity-40 mix-blend-screen blur-3xl z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/30 rounded-full animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/30 rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-indigo-600/30 rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 flex-1 relative z-10">

        <div className="mb-16 text-center max-w-3xl mx-auto mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm mb-8 backdrop-blur-md shadow-lg shadow-purple-500/10">
            <Sparkles size={16} className="text-yellow-400 animate-pulse" />
            <span className="font-medium tracking-wide">Discover inspiring prompts</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-300 drop-shadow-sm">
            Haru Video's Prompt Gallery
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
            Khám phá thư viện video được tạo bằng AI. Hover để xem trước, click vào video để khám phá chi tiết prompt và thông số tạo.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-zinc-500" size={32} />
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center border border-white/5">
              <Sparkles size={24} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Chưa có video nào!</h3>
            <p className="text-zinc-400 max-w-md">
              Hiện tại thư viện chưa có video nào.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <VideoCard key={video.id || index} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
