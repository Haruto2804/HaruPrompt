export const config = {
  matcher: '/video/:id',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  // Fetch original index.html from the same origin
  const response = await fetch(new URL('/', request.url));
  let html = await response.text();

  try {
    // Fetch video data from backend
    const apiUrl = 'https://haruprompt-2.onrender.com';
    const videoRes = await fetch(`${apiUrl}/api/videos/${id}`);
    
    if (videoRes.ok) {
      const video = await videoRes.json();
      const title = 'HaruPrompt - Video AI Gallery';
      const desc = (video.promptText || 'Khám phá video AI tuyệt đẹp').replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
      const image = video.thumbnailUrl;
      
      // Inject meta tags
      const ogTags = `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:type" content="video.other" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${image}" />
      `;
      html = html.replace('</head>', `${ogTags}</head>`);
      // Also attempt to replace title if it exists
      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    }
  } catch (e) {
    console.error('Middleware error:', e);
  }

  return new Response(html, {
    headers: { 'content-type': 'text/html;charset=UTF-8' },
  });
}
