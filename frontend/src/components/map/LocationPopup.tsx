import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Star, Clock, MapPin, Check } from 'lucide-react';
import { Location } from '../../types';
import { getLocationIcon } from '../../utils/locationIcons';

interface LocationPopupProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToCollection: (location: Location) => void;
  onAddToDay?: (location: Location) => void;
  map?: google.maps.Map | null; // Add map reference for positioning
  tripId?: string;
}

const LocationPopup: React.FC<LocationPopupProps> = ({
  location,
  isOpen,
  onClose,
  onSaveToCollection,
  onAddToDay,
  map,
  tripId,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [overlayContainer, setOverlayContainer] = useState<HTMLDivElement | null>(null);
  const [overlay, setOverlay] = useState<google.maps.OverlayView | null>(null);

  // Create and manage a Google Maps OverlayView anchored to the location
  useEffect(() => {
    if (!isOpen || !location || !map) {
      return;
    }

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.transform = 'translate(-50%, calc(-100% - 40px))';
    container.style.pointerEvents = 'auto';
    container.style.zIndex = '1000';

    const position = new google.maps.LatLng(location.coordinates.lat, location.coordinates.lng);

    class PopupOverlay extends google.maps.OverlayView {
      onAdd() {
        const panes = this.getPanes();
        panes?.floatPane.appendChild(container);
      }
      draw() {
        const projection = this.getProjection();
        if (!projection) return;
        const point = projection.fromLatLngToDivPixel(position);
        if (!point) return;
        container.style.left = `${point.x}px`;
        container.style.top = `${point.y}px`;
      }
      onRemove() {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }
    }

    const ov = new PopupOverlay();
    ov.setMap(map);
    setOverlay(ov);
    setOverlayContainer(container);

    return () => {
      ov.setMap(null);
      setOverlay(null);
      setOverlayContainer(null);
    };
  }, [isOpen, location, map]);
  
  // Check if location is already saved - move useEffect before early return
  useEffect(() => {
    if (location && tripId) {
      const tripSavedLocations = JSON.parse(localStorage.getItem(`savedLocations_${tripId}`) || '[]');
      const exists = tripSavedLocations.some((loc: Location) => loc.id === location.id);
      setIsSaved(exists);
    }
  }, [location, tripId]);
  
  if (!isOpen || !location) {
    return null;
  }


  const LocationIcon = getLocationIcon(location.type);

  const handleSaveToCollection = () => {
    onSaveToCollection(location);
    setIsSaved(true);
    console.log('LocationPopup: Saved location to collection:', location.name);
  };

  const handleAddToDay = () => {
    if (onAddToDay) {
      onAddToDay(location);
      console.log('LocationPopup: Added location to day:', location.name);
    }
  };

  // Function to get current day opening hours status
  const getCurrentDayOpeningHours = (openingHours: string) => {
    if (!openingHours) return null;
    
    // Check for 24-hour operation (24小時營業, 24 hours, 全天)
    const is24Hours = openingHours.includes('24小時') || 
                      openingHours.toLowerCase().includes('24') ||
                      openingHours.toLowerCase().includes('全天') ||
                      openingHours.toLowerCase().includes('24小時');
    
    if (is24Hours) {
      return { isOpen: true, is24Hours: true };
    }
    
    const today = new Date();
    // Chinese day names
    const dayNamesCN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dayNamesEN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = today.getDay();
    const currentDayNameCN = dayNamesCN[currentDayIndex];
    const currentDayNameEN = dayNamesEN[currentDayIndex];
    
    // Parse the opening hours string
    // Format from Google Maps (Chinese): "星期一: 11:30 – 14:00, 17:00 – 21:00, ..."
    // Multiple time ranges for the same day need to be handled
    const allDays = openingHours.split(',').map(day => day.trim());
    
    // Find the current day's hours - could have multiple time ranges
    const currentDayRanges: string[] = [];
    let found = false;
    
    for (let i = 0; i < allDays.length; i++) {
      const dayHours = allDays[i];
      const isCurrentDay = dayHours.startsWith(currentDayNameCN) || dayHours.toLowerCase().startsWith(currentDayNameEN.toLowerCase());
      
      if (isCurrentDay) {
        found = true;
        // Extract time range from "星期一: 11:30 – 21:00" or "11:30 – 14:00"
        const timeMatch = dayHours.match(/(\d{2}:\d{2})\s*–\s*(\d{2}:\d{2})/);
        if (timeMatch) {
          const [, start, end] = timeMatch;
          currentDayRanges.push(`${start} - ${end}`);
        }
      } else if (found) {
        // If we already found the current day, check if this is a continuation (another time range)
        const timeMatch = dayHours.match(/(\d{2}:\d{2})\s*–\s*(\d{2}:\d{2})/);
        if (timeMatch && !dayHours.match(/^(一|二|三|四|五|六|日)/)) {
          // It's another time range for the current day
          const [, start, end] = timeMatch;
          currentDayRanges.push(`${start} - ${end}`);
        } else {
          // We've moved to the next day, break
          break;
        }
      }
    }
    
    if (currentDayRanges.length === 0) return null;
    
    // Check if closed (no time ranges or "Closed" keyword)
    const isClosed = currentDayRanges.length === 0 || 
                     openingHours.toLowerCase().includes('closed') || 
                     openingHours.includes('休');
    
    if (isClosed) {
      return { isOpen: false, isClosed: true, is24Hours: false };
    }
    
    // Get current time
    const currentTime = today.toTimeString().slice(0, 5); // HH:MM format
    
    // Check if currently open by checking all time ranges
    let isOpen = false;
    let openTime = '';
    let closeTime = '';
    
    for (const timeRange of currentDayRanges) {
      const match = timeRange.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (match) {
        const [, start, end] = match;
        if (currentTime >= start && currentTime <= end) {
          isOpen = true;
          openTime = start;
          closeTime = end;
          break;
        }
      }
    }
    
    // If not currently open, use the first time range to show today's hours
    if (!isOpen && currentDayRanges.length > 0) {
      const firstRange = currentDayRanges[0];
      const match = firstRange.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      if (match) {
        openTime = match[1];
        closeTime = match[2];
      }
    }
    
    return { isOpen, openTime, closeTime, isClosed: false, is24Hours: false };
  };

  if (!overlayContainer) {
    return null;
  }

  return createPortal(
    <div className="bg-white rounded-lg shadow-lg max-w-xs w-64 border border-gray-200">
      {/* Speech bubble tail */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
      
      {/* Header */}
      <div className="relative p-3 border-b border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
        <h3 className="font-semibold text-gray-900 text-sm pr-6">{location.name}</h3>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Location Image */}
        {location.photoUrl && (
          <div className="mb-3">
            <img 
              src={location.photoUrl} 
              alt={location.name}
              className="w-full h-24 object-cover rounded-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <p className="text-xs text-gray-600 mb-3">{location.address}</p>
        
        {/* Opening Hours Status */}
        {location.openingHours && (() => {
          const hoursStatus = getCurrentDayOpeningHours(location.openingHours);
          
          // If no hours status, don't display anything
          if (!hoursStatus) return null;
          
          // Handle 24-hour operation
          if (hoursStatus.is24Hours) {
            return (
              <div className="flex items-center gap-1 mb-3 text-xs">
                <span className="text-green-600 font-medium">營業中</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">24小時營業</span>
              </div>
            );
          }
          
          // If closed for the entire day, only show "已打烊" without hours
          if (hoursStatus.isClosed) {
            return (
              <div className="flex items-center gap-1 mb-3 text-xs">
                <span className="text-red-600 font-medium">已打烊</span>
              </div>
            );
          }
          
          // If open or closed (but with hours), show status and hours
          return (
            <div className="flex items-center gap-1 mb-3 text-xs">
              {hoursStatus.isOpen ? (
                <>
                  <span className="text-green-600 font-medium">營業中</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{hoursStatus.openTime} - {hoursStatus.closeTime}</span>
                </>
              ) : (
                <>
                  <span className="text-red-600 font-medium">已打烊</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{hoursStatus.openTime} - {hoursStatus.closeTime}</span>
                </>
              )}
            </div>
          );
        })()}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSaveToCollection}
            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
              isSaved
                ? 'text-white hover:opacity-90'
                : 'text-white hover:opacity-90'
            }`}
            style={{
              backgroundColor: isSaved ? '#C1BB41' : '#E0BBA9'
            }}
          >
            {isSaved ? (
              <>
                <Check className="w-3 h-3" />
                <span>已儲存</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>儲存</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              const query = encodeURIComponent(`${location.name} ${location.address}`);
              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            }}
            className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-xs hover:bg-gray-200 transition-colors"
          >
            <MapPin className="w-3 h-3" />
            <span>查看</span>
          </button>
        </div>
      </div>
    </div>,
    overlayContainer
  );
};

export default LocationPopup;
