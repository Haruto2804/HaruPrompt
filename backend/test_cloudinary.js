const fs = require('fs');
const path = require('path');

async function testFetch() {
  try {
    const cloudName = "qyghjzdv";
    const uploadPreset = "g5lbZolWif8lCAkWCyaJowhBozg";
    const filePath = path.resolve('../testvideo/download.mp4');

    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'video/mp4' });
    
    const formData = new FormData();
    formData.append('file', blob, 'download.mp4');
    formData.append('upload_preset', uploadPreset);
    formData.append('resource_type', 'video');

    console.log('Starting fetch upload...');
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error(error);
  }
}

testFetch();
