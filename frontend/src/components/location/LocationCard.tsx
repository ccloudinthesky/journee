import React from 'react';
import { MapPin, Star, Clock, X, Utensils, Coffee, Bed, Landmark } from 'lucide-react';
import { Location } from '../../types';

// Helper function to get location icon
const getLocationIcon = (type: string) => {
  switch (type) {
    case 'restaurant':
      return Utensils;
    case 'cafe':
      return Coffee;
    case 'accommodation':
      return Bed;
    case 'attraction':
      return Landmark;
    default:
      return Landmark;
  }
};

interface LocationCardProps {
  location: Location;
  index?: number;
  showRemove?: boolean;
  onRemove?: () => void;
  isDragging?: boolean;
  onClick?: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  index,
  showRemove = false,
  onRemove,
  isDragging = false,
  onClick,
}) => {
  const LocationIcon = getLocationIcon(location.type);

  return (
    <div
      className={`bg-white rounded-lg p-4 transition-all cursor-pointer group ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } ${showRemove ? 'hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon/Number */}
        <div className="flex-shrink-0">
          {index !== undefined ? (
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
              {index + 1}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <LocationIcon className="w-5 h-5 text-gray-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 
            className="font-semibold text-gray-900 truncate"
            style={{
              fontFamily: 'SF Compact, system-ui, sans-serif',
              fontWeight: 556,
              fontSize: '14px',
              lineHeight: '17px',
              color: '#3A3A3A'
            }}
          >
            {location.name}
          </h3>
          <p 
            className="text-sm text-gray-500 truncate mt-1"
            style={{
              fontFamily: 'SF Compact, system-ui, sans-serif',
              fontWeight: 556,
              fontSize: '12px',
              lineHeight: '14px',
              color: '#848484'
            }}
          >
            {location.address}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
            {location.openingHours && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="truncate">{location.openingHours}</span>
              </div>
            )}
          </div>
        </div>

        {/* Remove button - only visible on hover */}
        {showRemove && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-all opacity-0 group-hover:opacity-100"
            aria-label="Remove location"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationCard;

