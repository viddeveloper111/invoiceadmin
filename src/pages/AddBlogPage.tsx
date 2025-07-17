import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button'; // Assuming Button is available here
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react'; // For the Cancel button icon

// Import the specific forms for each website
import AddSolarStationBlogForm from '@/components/AddSolarStationBlogForm';
import AddVidhemaBlogForm from '@/components/AddVidhemaBlogForm';

export default function AddBlogPage(): JSX.Element {
  const navigate = useNavigate();
  const [selectedWebsite, setSelectedWebsite] = useState<'solarstation.in' | 'vidhema.com'>('solarstation.in');

  return (
    <div className="container mx-auto p-6 space-y-8">
      

      <div className="flex flex-col  sm:flex-row items-center justify-end gap-4 mb-8">
        <Label htmlFor="website-selector" className="text-lg font-medium text-gray-700">
          Publish to:
        </Label>
        <Select
          value={selectedWebsite}
          onValueChange={(value: 'solarstation.in' | 'vidhema.com') => setSelectedWebsite(value)}
        >
          <SelectTrigger id="website-selector" className="w-[250px] sm:w-[200px] h-10 px-4 py-2 border rounded-md text-base focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Select Website" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <SelectItem value="solarstation.in">solarstation.in</SelectItem>
            <SelectItem value="vidhema.com">vidhema.com</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conditionally render the appropriate form based on selection */}
      {selectedWebsite === 'solarstation.in' ? (
        <AddSolarStationBlogForm />
      ) : (
        <AddVidhemaBlogForm />
      )}
    </div>
  );
}