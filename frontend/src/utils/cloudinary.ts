export const optimizeCloudinaryUrl = (url: string | undefined): string => {
  if (!url) return '';
  // Only apply transformations to standard Cloudinary upload URLs
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // If it already has f_auto or q_auto, don't duplicate
    if (url.includes('f_auto') || url.includes('q_auto')) return url;
    
    // Inject f_auto,q_auto into the path immediately after /upload/
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  return url;
};
