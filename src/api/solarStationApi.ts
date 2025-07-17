// src/api/solarStationApi.ts

// Import the specific raw types for SolarStation from their dedicated file
import { SolarStationRawBlog, SolarStationApiResponse } from '../types/solarstation';
// Import the common/normalized BlogPost interface from the main types file
import { BlogPost } from '../types';

export async function fetchSolarStationBlogs(): Promise<BlogPost[]> {
  const SOLARSTATION_API_URL = 'https://api.solarstation.in/blogs/allBlogs'; // **CONFIRM THIS URL**

  try {
    const response = await fetch(SOLARSTATION_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch SolarStation blogs: ${response.statusText}`);
    }
    const result: SolarStationApiResponse = await response.json();

    if (!result || !Array.isArray(result.data)) {
        throw new Error("SolarStation API response structure is unexpected or 'data' array is missing.");
    }

    return result.data.map((rawBlog: SolarStationRawBlog) => ({
      id: rawBlog._id,
      title: rawBlog.title,
      // Generate slug from title, as SolarStation might not provide a direct 'slug' field
      slug: rawBlog.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'),
      briefDescription: rawBlog["brief description"],
      description: rawBlog["detail description"],
      featuredImage: rawBlog["blog image"] || '',
      backgroundImage: '', // SolarStation doesn't provide this, default empty
      date: rawBlog.date,
      author: 'SolarStation Team', // Default author if API doesn't provide
      category: 'General', // Default category if API doesn't provide
      tags: Array.isArray(rawBlog.tags) ? rawBlog.tags : [],
      isFeatured: rawBlog.isFeatured ? 'Yes' : 'No', // Map boolean to 'Yes'/'No'
      website: 'solarstation.in', // Explicitly set for filtering
      keywords: rawBlog.keywords || '',


      metaTitle: rawBlog.title, // Use title as metaTitle fallback
      metaDescription: rawBlog["meta description"] || '',
      metaKeywords: rawBlog.keywords || '', // Map keywords to metaKeywords
      metaImageurl: rawBlog["blog image"] || '', // Use blog image as metaImageurl fallback
      metaImagealt: rawBlog.title, // Use title as alt text fallback
      metaImagetitle: rawBlog.title, // Use title as meta image title fallback

      url: '', // SolarStation's specific URL if different from slug. Default empty.
      technology: '', // Not provided by SolarStation, default empty
      faq: [], // Not provided by SolarStation, default empty
    }));
  } catch (error) {
    console.error('Error fetching SolarStation blogs:', error);
    throw error;
  }
}