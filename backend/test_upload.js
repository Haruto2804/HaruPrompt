const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    const filePath = path.resolve('../testvideo/download.mp4');
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }

    const fileStream = fs.createReadStream(filePath);
    
    // We need form-data library, or native fetch since Node 18 supports FormData but Node fetch FormData doesn't easily take streams from fs without a bit of work. 
    // Let's just use the native fetch if available, but Node's native fetch with Blob/File is a bit tricky.
    // I will just use fetch with a raw multipart boundary or just install form-data locally.
    
  } catch (error) {
    console.error(error);
  }
}
testUpload();
