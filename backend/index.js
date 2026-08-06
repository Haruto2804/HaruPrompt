const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { db, FieldValue, auth } = require('./firebase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const rateLimit = require('express-rate-limit');

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting (Bảo vệ API khỏi spam/DDoS)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 100, // Tối đa 100 requests / 1 phút / 1 IP
  message: { error: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 1 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Auth Middleware
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const email = decodedToken.email;
    
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim()) : [];
    if (!adminEmails.includes(email)) {
      return res.status(403).json({ error: `Forbidden: User ${email} is not an admin` });
    }
    
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// In-Memory Cache for Videos
let videoCache = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

const getCachedVideos = async () => {
  if (videoCache && Date.now() - lastCacheTime < CACHE_TTL) {
    console.log('[CACHE HIT] Trả dữ liệu từ RAM siêu tốc!');
    return { data: videoCache, cached: true };
  }
  
  console.log('[CACHE MISS] Truy vấn Firestore (chỉ chạy 1 lần mỗi 5 phút)...');
  const snapshot = await db.collection('videos').orderBy('createdAt', 'desc').limit(1000).get();
  videoCache = [];
  snapshot.forEach((doc) => {
    videoCache.push({ id: doc.id, ...doc.data() });
  });
  lastCacheTime = Date.now();
  return { data: videoCache, cached: false };
};

// Get videos route (with Cache & Pagination)
app.get('/api/videos', async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limitCount = parseInt(req.query.limit) || 24;
    
    const cacheResult = await getCachedVideos();
    let allVideos = cacheResult.data;
    
    // Gắn thêm Header để Frontend biết là có dùng Cache hay không
    res.setHeader('X-Cache-Status', cacheResult.cached ? 'HIT' : 'MISS');
    
    if (search) {
      const searchLower = search.toLowerCase();
      allVideos = allVideos.filter(v => {
        const textMatch = v.promptText && v.promptText.toLowerCase().includes(searchLower);
        const blockMatch = v.prompts && v.prompts.some(p => p.text && p.text.toLowerCase().includes(searchLower));
        return textMatch || blockMatch;
      });
    }
    
    // Pagination
    const startIndex = (page - 1) * limitCount;
    const endIndex = page * limitCount;
    const paginatedVideos = allVideos.slice(startIndex, endIndex);
    
    res.json({
      videos: paginatedVideos,
      hasMore: endIndex < allVideos.length,
      total: allVideos.length
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get single video route
app.get('/api/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Thử lấy từ Cache trước
    const cacheResult = await getCachedVideos();
    const cachedVideo = cacheResult.data.find(v => v.id === id);
    
    if (cachedVideo) {
      res.setHeader('X-Cache-Status', 'HIT');
      return res.json(cachedVideo);
    }

    // Nếu không có trong cache thì mới gọi Firebase (Fallback)
    res.setHeader('X-Cache-Status', 'MISS');
    const docRef = db.collection('videos').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Upload route (Protected)
app.post('/api/upload', authenticateAdmin, upload.single('file'), async (req, res) => {
  try {
    const { promptText, prompts } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    let parsedPrompts = [];
    if (prompts) {
      try { parsedPrompts = JSON.parse(prompts); } catch(e) {}
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Cloudinary config is missing' });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    // Upload to Cloudinary using signed stream (more secure, requires api key/secret)
    const uploadToCloudinary = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    const cloudinaryResult = await uploadToCloudinary;
    const videoUrl = cloudinaryResult.secure_url;
    const thumbnailUrl = videoUrl.replace(/\.[^/.]+$/, ".jpg");

    // Save to Firebase Database using Admin SDK
    await db.collection('videos').add({
      videoUrl,
      thumbnailUrl,
      promptText: promptText || '',
      prompts: parsedPrompts,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      videoUrl,
      thumbnailUrl,
      prompts: parsedPrompts,
      message: 'Upload and database save successful',
    });
  } catch (error) {
    console.error('Error in upload:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Upload image only route (Protected)
app.post('/api/upload-image', authenticateAdmin, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Cloudinary config is missing' });
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    const uploadToCloudinary = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    const result = await uploadToCloudinary;
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Error in upload-image:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Update video route (Protected)
app.put('/api/videos/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { promptText, prompts } = req.body;

    const updateData = { updatedAt: FieldValue.serverTimestamp() };
    if (promptText !== undefined) updateData.promptText = promptText;
    if (prompts !== undefined) updateData.prompts = prompts;

    await db.collection('videos').doc(id).update(updateData);

    res.json({ success: true, message: 'Video updated successfully' });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video route (Protected)
app.delete('/api/videos/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get video document to find Cloudinary URL
    const docRef = db.collection('videos').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const videoData = docSnap.data();
    const videoUrl = videoData.videoUrl;
    
    // 2. Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/<cloud_name>/video/upload/v<version>/<public_id>.mp4
    const urlParts = videoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = fileName.split('.')[0];
    
    // 3. Delete from Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    
    // 4. Delete from Firestore
    await docRef.delete();
    
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Get site settings
app.get('/api/settings', async (req, res) => {
  try {
    const docRef = db.collection('settings').doc('general');
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.json({ aiGuideHtml: '', noticeHtml: '' });
    }
    
    res.json(docSnap.data());
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update site settings (Protected)
app.put('/api/settings', authenticateAdmin, async (req, res) => {
  try {
    const { aiGuideHtml, noticeHtml } = req.body;
    
    await db.collection('settings').doc('general').set({
      aiGuideHtml: aiGuideHtml || '',
      noticeHtml: noticeHtml || '',
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Settings Update Error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
