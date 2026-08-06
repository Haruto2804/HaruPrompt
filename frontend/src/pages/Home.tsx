import React, { useEffect, useState } from 'react';
import type { Video } from '../types';
import VideoCard from '../components/VideoCard';
import { Sparkles, Loader2, Lightbulb, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

// Mock data removed as per user request

const Home: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Fetch from backend API
        const response = await fetch(`${API_BASE_URL}/api/videos`);
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

        {/* Free AI Guide & Notice */}
        <div className="mb-20 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-10">
              {/* Guide */}
              <div className="flex-1 space-y-5">
                <h3 className="text-xl font-bold text-indigo-300 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Cách Dùng AI Miễn Phí
                </h3>
                <ul className="space-y-4 text-zinc-300 text-sm leading-relaxed">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-medium text-xs mt-0.5">1</span>
                    <p>Truy cập vào các nền tảng AI tạo video miễn phí như <b>Haiper</b>, <b>Luma Dream Machine</b>, hoặc <b>Kling AI</b>.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-medium text-xs mt-0.5">2</span>
                    <p>Bấm vào một video bất kỳ bên dưới, copy phần <b>Prompt (Câu lệnh)</b> mà chúng tôi đã cung cấp sẵn.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-medium text-xs mt-0.5">3</span>
                    <p>Dán Prompt đó vào công cụ AI, tinh chỉnh lại một số từ khóa theo ý thích và bấm Generate!</p>
                  </li>
                </ul>
              </div>

              {/* Notice */}
              <div className="flex-1 space-y-5">
                <h3 className="text-xl font-bold text-pink-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-pink-400" />
                  Lưu Ý Quan Trọng
                </h3>
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-6 text-sm text-pink-200/90 leading-relaxed shadow-inner">
                  <p className="mb-3">
                    🚀 <b>Chất lượng video</b> phụ thuộc rất nhiều vào công cụ AI bạn đang dùng. Prompt (Câu lệnh) chỉ đóng vai trò hướng dẫn nội dung cho AI.
                  </p>
                  <p>
                    ⚠️ Các công cụ AI miễn phí thường có <b>giới hạn số lần tạo</b> mỗi ngày. Hãy tận dụng tối đa những bộ Prompt được tối ưu sẵn ở đây để đỡ tốn lượt generate hỏng nhé!
                  </p>
                </div>
              </div>
            </div>
          </div>
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
