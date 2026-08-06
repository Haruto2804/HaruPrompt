const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { db, FieldValue, auth } = require('./firebase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Get videos route
app.get('/api/videos', async (req, res) => {
  try {
    const videosRef = db.collection('videos');
    const snapshot = await videosRef.orderBy('createdAt', 'desc').limit(20).get();
    
    const videos = [];
    snapshot.forEach((doc) => {
      videos.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get single video route
app.get('/api/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
    const { promptText } = req.body;
    const file = req.file;

    if (!file || !promptText) {
      return res.status(400).json({ error: 'File and promptText are required' });
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
      promptText,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      videoUrl,
      thumbnailUrl,
      promptText,
      message: 'Upload and database save successful',
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload video' });
  }
});

// Upload image route for Editor (Protected)
app.post('/api/upload-image', authenticateAdmin, upload.single('files[0]'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

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

    const cloudinaryResult = await uploadToCloudinary;
    const imageUrl = cloudinaryResult.secure_url;

    res.json({
      success: true,
      url: imageUrl
    });
  } catch (error) {
    console.error('Image Upload Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Update video route (Protected)
app.put('/api/videos/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { promptText } = req.body;
    
    if (!promptText) {
      return res.status(400).json({ error: 'promptText is required' });
    }

    await db.collection('videos').doc(id).update({
      promptText,
      updatedAt: FieldValue.serverTimestamp()
    });

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
