import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Video } from '../types';
import { ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/videos/${id}`);
        if (!response.ok) {
          throw new Error('Video not found');
        }
        const data = await response.json();
        setVideo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching video');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideo();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white w-10 h-10" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Oops! Something went wrong</h1>
        <p className="text-zinc-400 mb-8">{error || 'Video not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Gallery</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Video Player Section */}
          <div className="sticky top-24">
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl group">
              <video
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/90 text-sm font-medium">
                <Sparkles size={16} className="text-yellow-500" />
                AI Generated
              </div>
            </div>
          </div>

          {/* Details & Prompt Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                Video Details & Prompt
              </h1>
              <p className="text-zinc-400 text-lg border-b border-white/10 pb-8">
                Discover the detailed prompt, imagery, and styling used to generate this stunning piece of AI video art.
              </p>
            </div>

            <div className="prose prose-invert prose-p:text-zinc-300 prose-headings:text-white prose-a:text-blue-400 max-w-none">
              <div
                className="bg-zinc-900/50 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl"
                dangerouslySetInnerHTML={{ __html: video.promptText }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
