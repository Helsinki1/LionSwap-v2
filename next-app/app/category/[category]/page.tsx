// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product-grid';
import { ArrowLeft, Package, Plus, Tag } from 'lucide-react';
import type { Product } from '@/lib/types';

interface CategoryPageProps {
  params: { category: string };
}

// Helper function to map URL slugs to database category names
function getCategoryName(slug: string): string {
  const categoryMap: Record<string, string> = {
    "Textbooks": "Textbooks",
    "Electronics": "Electronics",
    "Furniture": "Furniture",
    "Clothing": "Clothing",
    "Accessories": "Accessories",
    "Dorm": "Dorm Essentials", // This is the critical mapping
    "Sports": "Sports",
    "Tickets": "Event Tickets",
    "Services": "Services",
    "Other": "Other"
  };
  
  return categoryMap[slug] || slug;
}

// Helper function to get display name (for UI)
function getDisplayName(slug: string): string {
  const displayMap: Record<string, string> = {
    "Textbooks": "Textbooks",
    "Electronics": "Electronics", 
    "Furniture": "Furniture",
    "Clothing": "Clothing",
    "Accessories": "Accessories",
    "Dorm": "Dorm Essentials",
    "Sports": "Sports",
    "Tickets": "Event Tickets",
    "Services": "Services",
    "Other": "Other"
  };
  
  return displayMap[slug] || decodeURIComponent(slug);
}

async function getCategoryListings(category: string): Promise<Product[]> {
  try {
    // Convert URL slug to actual category name used in database
    const actualCategory = getCategoryName(category);
    
    // Added cache-busting timestamp query parameter
    const timestamp = new Date().getTime();
    
    console.log(`Fetching category: ${actualCategory}`); // Debug log
    
    const { data } = await axios.get<{ listings: Product[] }>(
      `https://lionswap.onrender.com/listings/category/${encodeURIComponent(actualCategory)}?t=${timestamp}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
    );
    
    // Add unoptimized property for images to work correctly with Next.js
    const processedListings = data.listings
    
    // .map(listing => ({
    //   ...listing,
    //   // Force all listings to appear as available in the category view
    //   isAvailable: true
    // }));
    
    return processedListings;
  } catch (error) {
    console.error("Error fetching category listings:", error);
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Get the category slug from params (nextjs async component fix)
  const categorySlug = await params.category;
  
  // Get the display name for UI
  const displayName = getDisplayName(categorySlug);
  
  // Fetch listings using the category parameter
  const categoryProducts = await getCategoryListings(categorySlug);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Category header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Tag className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-blue-800">{displayName}</h1>
          </div>
        </div>

        {/* Listings grid or empty state */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <p className="text-blue-700 font-medium">
              {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'} found
            </p>
          </div>
          {categoryProducts.length > 0 ? (
            <ProductGrid products={categoryProducts} />
          ) : (
            <div className="py-16 text-center">
              <Package className="h-16 w-16 mx-auto text-blue-200 mb-4" />
              <h2 className="text-2xl font-bold text-blue-800 mb-3">No items found</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We couldn't find any items in this category. Be the first to list something!
              </p>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Have something to sell?</h2>
          <p className="mb-6 max-w-md mx-auto opacity-90">
            List your items for free and connect with buyers from the Columbia community.
          </p>
          <Link href="/listings/new">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-6 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1">
              <Plus className="mr-2 h-5 w-5" />
              List an item
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}