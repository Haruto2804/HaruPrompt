export const optimizeCloudinaryUrl = (url: string | undefined, width?: number, isVideo: boolean = false): string => {
  if (!url) return '';
  // Only apply transformations to standard Cloudinary upload URLs
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // If it already has f_auto or q_auto, don't duplicate
    if (url.includes('f_auto') || url.includes('q_auto')) return url;
    
    let transformations = 'f_auto,q_auto';
    if (width) {
      transformations += `,w_${width},c_limit`;
    }
    if (isVideo) {
      transformations += `,l_text:Roboto_32_bold:HaruPrompt.online,co_white,g_south_east,y_20,x_20,o_70`;
    }
    
    // Inject transformations into the path immediately after /upload/
    return url.replace('/upload/', `/upload/${transformations}/`);
  }
  return url;
};
