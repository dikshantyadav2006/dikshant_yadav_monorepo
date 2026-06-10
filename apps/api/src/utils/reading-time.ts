export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const cleanContent = content
    .replace(/[#*`_~\[\]]/g, '') // remove markdown symbols
    .replace(/<[^>]*>/g, '');   // remove HTML tags
  
  const words = cleanContent.trim().split(/\s+/).filter(w => w.length > 0);
  const minutes = Math.ceil(words.length / wordsPerMinute);
  
  return minutes > 0 ? minutes : 1;
}
