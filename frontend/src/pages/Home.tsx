import React, { useEffect, useState } from 'react';
import type { Video } from '../types';
import VideoCard from '../components/VideoCard';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, Lightbulb, Search } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Mock data removed as per user request

const Home: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchVideos = async (query = '', pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('search', query);
      searchParams.append('page', pageNum.toString());
      searchParams.append('limit', '24');
      
      const url = `${API_BASE_URL}/api/videos?${searchParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos from backend');
      }

      const data = await response.json();
      const fetchedVideos = data.videos || [];
      
      if (isLoadMore) {
        setVideos(prev => [...prev, ...fetchedVideos]);
      } else {
        setVideos(fetchedVideos);
      }
      
      setHasMore(data.hasMore || false);
      setPage(pageNum);
    } catch (error) {
      console.warn("Error fetching data.", error);
      if (!isLoadMore) setVideos([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos(searchQuery, 1, false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchVideos(searchQuery, page + 1, true);
    }
  };

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

        {/* Link to Free AI Guide Page */}
        <div className="flex justify-center mb-12">
          <Link 
            to="/guide"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-medium transition-all hover:scale-105"
          >
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Xem Hướng dẫn & Lưu ý tạo Video AI
          </Link>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12 relative z-20">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50 group-hover:opacity-100"></div>
            <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
              <div className="pl-4 pr-3 text-zinc-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm prompt (ví dụ: cinematic, neon, cat...)"
                className="flex-1 min-w-0 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-zinc-500 text-sm sm:text-base py-2.5 sm:py-3"
              />
              <button
                type="submit"
                className="ml-1 sm:ml-2 shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/5"
              >
                Tìm Kiếm
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div 
                key={index} 
                className="aspect-[4/5] rounded-2xl bg-zinc-800/50 animate-pulse border border-white/5 flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            ))}
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
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <VideoCard key={video.id || index} video={video} />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 shadow-lg"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    'Tải thêm Video'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
