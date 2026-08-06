import React, { useEffect, useState } from 'react';
import { Lightbulb, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Guide: React.FC = () => {
  const [aiGuideHtml, setAiGuideHtml] = useState<string | null>(null);
  const [noticeHtml, setNoticeHtml] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.aiGuideHtml) setAiGuideHtml(data.aiGuideHtml);
          if (data.noticeHtml) setNoticeHtml(data.noticeHtml);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen pt-8 pb-20 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none opacity-40 mix-blend-screen blur-3xl z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/30 rounded-full animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/30 rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-indigo-600/30 rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} />
          <span>Quay lại Trang chủ</span>
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-300 drop-shadow-sm">
            Hướng Dẫn & Lưu Ý
          </h1>
          <p className="text-zinc-400 text-lg">Tất cả những gì bạn cần biết để tạo ra video hoàn hảo bằng AI</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-10">
            {/* Guide */}
            <div className="flex-1 space-y-5">
              <h3 className="text-xl font-bold text-indigo-300 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Cách Dùng AI Miễn Phí
              </h3>
              {aiGuideHtml ? (
                <div className="text-zinc-300 text-sm leading-relaxed max-w-none [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4" dangerouslySetInnerHTML={{ __html: aiGuideHtml }} />
              ) : (
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
              )}
            </div>

            {/* Notice */}
            <div className="flex-1 space-y-5">
              <h3 className="text-xl font-bold text-pink-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-pink-400" />
                Lưu Ý Quan Trọng
              </h3>
              {noticeHtml ? (
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-6 text-sm text-pink-200/90 leading-relaxed shadow-inner max-w-none [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4" dangerouslySetInnerHTML={{ __html: noticeHtml }} />
              ) : (
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-6 text-sm text-pink-200/90 leading-relaxed shadow-inner">
                  <p className="mb-3">
                    🚀 <b>Chất lượng video</b> phụ thuộc rất nhiều vào công cụ AI bạn đang dùng. Prompt (Câu lệnh) chỉ đóng vai trò hướng dẫn nội dung cho AI.
                  </p>
                  <p>
                    ⚠️ Các công cụ AI miễn phí thường có <b>giới hạn số lần tạo</b> mỗi ngày. Hãy tận dụng tối đa những bộ Prompt được tối ưu sẵn ở đây để đỡ tốn lượt generate hỏng nhé!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;
