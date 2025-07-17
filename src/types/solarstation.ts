// src/types/solarstation.ts

export interface SolarStationRawBlog {
    _id: string; // Assuming MongoDB ID or similar unique string ID
    title: string;
    "brief description": string; // Note: field name with space
    "detail description": string; // Note: field name with space
    date: string;
    isFeatured: boolean; // Assuming boolean for the raw API response
    "blog image": string; // Note: field name with space, URL
    keywords: string; // Comma-separated string for keywords/metaKeywords
    tags: string[]; // Array of strings for general tags
    "meta tags"?: string; // Ambiguous, but if it exists in API, include it
    "meta description": string; // Note: field name with space
    // SolarStation might also have: slug, author, category etc. but not explicitly listed, so making them optional in common BlogPost
    // Add 'website' field if the raw API response includes it
    website?: string; // Added this as you're using it in transformSolarStationBlog
  }
  
  export interface SolarStationApiResponse {
    success: boolean;
    message?: string;
    data: SolarStationRawBlog[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  }