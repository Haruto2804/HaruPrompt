import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Upload, Loader2, AlertCircle, CheckCircle2, Edit2, Trash2, X, Save, Info } from 'lucide-react';
import type { Video } from '../types';
import { auth } from '../firebase';
import JoditEditor from 'jodit-react';
import { API_BASE_URL } from '../config';

const Admin: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [promptText, setPromptText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Edit state
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editPromptText, setEditPromptText] = useState('');
  const [updating, setUpdating] = useState(false);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Settings state
  const [aiGuideHtml, setAiGuideHtml] = useState('');
  const [noticeHtml, setNoticeHtml] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    // Get initial token for the Jodit editor uploads
    const fetchToken = async () => {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        setAuthToken(token);
      }
    };
    fetchToken();
  }, []);
  
  const editor = useRef(null);
  const editorConfig = useMemo(() => ({
    theme: 'dark',
    placeholder: 'Enter the AI prompt and format it here...',
    height: 400,
    uploader: {
      insertImageAsBase64URI: false,
      url: `${API_BASE_URL}/api/upload-image`,
      headers: authToken ? {
        'Authorization': `Bearer ${authToken}`
      } : {},
      isSuccess: function(resp: any) {
        return !resp.error;
      },
      process: function (resp: any) {
        return {
          files: resp.url ? [resp.url] : [],
          path: '',
          baseurl: '',
          error: resp.error ? 1 : 0,
          msg: resp.error || ''
        };
      },
      defaultHandlerSuccess: function (data: any) {
        if (data.files && data.files.length) {
          // @ts-ignore
          this.s.insertImage(data.files[0]);
        }
      }
    },
    style: {
      background: '#18181b', // zinc-900 to match theme
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  }), [authToken]);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/videos`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (err) {
      console.error('Failed to fetch videos', err);
    } finally {
      setLoadingVideos(false);
    }
  };

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

  useEffect(() => {
    fetchVideos();
    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !promptText) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = await auth.currentUser?.getIdToken();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('promptText', promptText);

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload video via backend');
      }

      setSuccess(true);
      setFile(null);
      setPromptText('');
      
      // Refresh video list
      fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setEditPromptText(video.promptText);
  };

  const handleUpdate = async () => {
    if (!editingVideo) return;
    setUpdating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ promptText: editPromptText })
      });
      if (res.ok) {
        setEditingVideo(null);
        fetchVideos();
      } else {
        alert('Failed to update video');
      }
    } catch (err) {
      alert('Error updating video');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ aiGuideHtml, noticeHtml })
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this video? This will also remove it from Cloudinary.')) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/videos/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) fetchVideos();
        else alert('Failed to delete video');
      } catch (err) {
        alert('Error deleting video');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-12 px-4">
      {/* Upload Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-8">Upload New Video</h1>
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-400">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">Video uploaded successfully!</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Video File</label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-white/10 border-dashed rounded-xl cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-300">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-4 text-zinc-400 group-hover:text-white transition-colors" />
                      <p className="mb-2 text-sm text-zinc-400">
                        <span className="font-semibold text-white">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-zinc-500">MP4, WebM or OGG (MAX. 50MB)</p>
                    </div>
                    <input 
                      id="dropzone-file" 
                      type="file" 
                      className="hidden" 
                      accept="video/*"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                </div>
              </div>
              {file && (
                <p className="mt-3 text-sm text-zinc-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Guide Container */}
            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center gap-3 text-blue-400 font-semibold text-lg">
                <Info className="w-5 h-5" />
                Hướng dẫn & Lưu ý khi viết Prompt
              </div>
              <ul className="list-disc list-outside space-y-2 text-sm text-blue-200/80 ml-6">
                <li>Sử dụng thanh công cụ <b>Jodit Editor</b> bên dưới để định dạng văn bản (in đậm, in nghiêng, đổi màu).</li>
                <li>Để <b>chèn ảnh</b> vào bài viết, hãy bấm vào icon hình bức ảnh trên thanh công cụ và tải ảnh từ máy lên (tự động upload).</li>
                <li>Không nên chèn ảnh có dung lượng quá lớn (khuyến nghị dưới 2MB mỗi ảnh).</li>
                <li>Sau khi đăng, bạn luôn có thể ấn nút Edit (Hình cây bút) ở bảng Quản lý Video bên dưới để chỉnh sửa lại nội dung này.</li>
              </ul>
            </div>

            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-zinc-400 mb-2">Detailed Prompt (Text & Images)</label>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <JoditEditor
                  ref={editor}
                  value={promptText}
                  config={editorConfig}
                  onBlur={newContent => setPromptText(newContent)}
                  onChange={() => {}}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || !promptText || uploading}
              className={`w-full py-4 px-6 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                !file || !promptText || uploading
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  Upload Video
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Video Management Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Manage Videos</h2>
        <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {loadingVideos ? (
            <div className="p-8 flex justify-center text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : videos.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No videos found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="text-xs uppercase bg-black/40 text-zinc-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Thumbnail</th>
                    <th className="px-6 py-4">Prompt</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 w-32">
                        <img src={video.thumbnailUrl} alt="Thumbnail" className="w-24 h-16 object-cover rounded-md border border-white/10" />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs line-clamp-3">
                        <div dangerouslySetInnerHTML={{ __html: video.promptText.substring(0, 150) + '...' }} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleEdit(video)}
                          className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit Prompt"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(video.id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Site Content Management Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Manage Site Content</h2>
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Free AI Guide Content</label>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <JoditEditor
                value={aiGuideHtml}
                config={editorConfig}
                onBlur={newContent => setAiGuideHtml(newContent)}
                onChange={() => {}}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Important Notice Content</label>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <JoditEditor
                value={noticeHtml}
                config={editorConfig}
                onBlur={newContent => setNoticeHtml(newContent)}
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium flex items-center gap-2 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:hover:scale-100"
            >
              {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Content
            </button>
          </div>
        </div>
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Video Prompt</h2>
              <button onClick={() => setEditingVideo(null)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6 rounded-xl overflow-hidden border border-white/10">
              <JoditEditor
                value={editPromptText}
                config={editorConfig}
                onBlur={newContent => setEditPromptText(newContent)}
                onChange={() => {}}
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setEditingVideo(null)}
                className="px-6 py-2 rounded-xl text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={updating}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium flex items-center gap-2 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:hover:scale-100"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
