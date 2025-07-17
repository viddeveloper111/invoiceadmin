// src/api/vidhemaApi.ts

// Import the specific raw types for Vidhema from their dedicated file
import { VidhemaRawBlog, VidhemaApiResponse } from '../types/vidhema'; // Ensure VidhemaApiResponse is `VidhemaRawBlog[]`
// Import the common/normalized BlogPost interface from the main types file
import { BlogPost } from '../types';

// This function transforms a single VidhemaRawBlog into a BlogPost
function transformVidhemaBlogToBlogPost(rawBlog: VidhemaRawBlog): BlogPost {
  return {
    id: rawBlog._id, // Use actual _id as string
    title: rawBlog.title,
    slug: rawBlog.url.split('/').pop() || rawBlog.url, // Extract slug from URL, fallback to full URL
    briefDescription: rawBlog.short_description,
    description: rawBlog.detail_description,
    technology: rawBlog.technology || '',
    featuredImage: rawBlog.featured_image || '',
    backgroundImage: rawBlog.background_image || '',
    date: rawBlog.date,
    author: rawBlog.select_author || 'Unknown Author',
    category: rawBlog.select_category || 'Uncategorized',
    tags: Array.isArray(rawBlog.meta_titlemetatags) ? rawBlog.meta_titlemetatags : [],
    isFeatured: rawBlog.is_featured ? 'Yes' : 'No', // Map boolean from API to 'Yes'/'No'
    website: 'vidhema.com', // Explicitly set for filtering
    keywords: rawBlog.meta_keywords || '',

    metaTitle: rawBlog.meta_title || rawBlog.title, // Fallback to title
    metaDescription: rawBlog.meta_description || rawBlog.short_description, // Fallback to short description
    metaKeywords: rawBlog.meta_keywords || '',
    metaImageurl: rawBlog.meta_imageurl || rawBlog.featured_image || '', // Fallback to featured image
    metaImagealt: rawBlog.meta_imagealt || rawBlog.title, // Fallback to title
    metaImagetitle: rawBlog.meta_imagetitle || rawBlog.title, // Fallback to title

    url: rawBlog.url, // Keep the original URL from Vidhema
    faq: Array.isArray(rawBlog.faq) ? rawBlog.faq : [],
  };
}

export async function fetchVidhemaBlogs(): Promise<BlogPost[]> {
  // Your current filter is fixed to skip:0, limit:10.
  // If you need pagination support here, you'll need to pass page/limit arguments.
  const VIDHEMA_API_URL = 'https://api.vidhema.com/blogs?filter=%7B%22order%22%3A%7B%22createdAt%22%3A-1%7D%2C%22skip%22%3A0%2C%22limit%22%3A10%7D';
  const VIDHEMA_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMGMxMDY1NGM1ZDUwMGY2NDM3YmQzMSIsImVtYWlsIjoic2FsZXNAdmlkaGVtYS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTI2NDQyNjIsImV4cCI6MTc1MjczMDY2Mn0.mpg--uAlcSkTXMWTZShBgq-p58gnlgPDv9bs8zniY8E";

  try {
    const response = await fetch(VIDHEMA_API_URL, {
      headers: {
        'access_token': VIDHEMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch Vidhema blogs: ${response.status} ${response.statusText}`);
    }

    // --- CRITICAL CHANGE HERE ---
    // The API returns an array directly, so 'result' IS the array.
    const result: VidhemaApiResponse = await response.json(); // result is now VidhemaRawBlog[]

    // Check if it's an array directly
    if (!Array.isArray(result)) {
        throw new Error("Vidhema API response structure is unexpected (expected a direct array).");
    }
    // Map directly from 'result' (which is already the array)
    return result.map(transformVidhemaBlogToBlogPost);
  } catch (error) {
    console.error('Error fetching Vidhema blogs:', error);
    throw error;
  }
}