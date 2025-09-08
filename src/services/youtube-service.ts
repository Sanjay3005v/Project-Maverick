
'use server';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function searchVideo(query: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    console.error('YOUTUBE_API_KEY environment variable is not set.');
    throw new Error('YOUTUBE_API_KEY environment variable is not set.');
  }

  const url = `${YOUTUBE_API_URL}?part=snippet&q=${encodeURIComponent(
    query
  )}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData.error.message);
      throw new Error(`YouTube API Error: ${errorData.error.message}`);
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    return null;
  } catch (error: any) {
    console.error('Failed to fetch from YouTube API:', error);
    throw new Error(error.message || 'Failed to fetch from YouTube API');
  }
}
