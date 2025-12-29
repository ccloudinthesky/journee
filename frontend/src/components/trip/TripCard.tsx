import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { Trip } from '../../types';

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const navigate = useNavigate();

  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      return 'Date not available';
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date';
    }
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const getDaysUntilStart = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      return 'Date not available';
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const endTime = end.getTime();
    const nowTime = now.getTime();
    
    // If current time is after the trip's end date, show "Finished"
    if (nowTime > endTime) {
      return 'Finished';
    }
    
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'In progress';
    if (diffDays === 0) return 'Starts today';
    if (diffDays === 1) return 'Starts tomorrow';
    return `Starts in ${diffDays} days`;
  };

  const getTotalLocations = () => {
    return trip.days.reduce((total, day) => total + day.locations.length, 0);
  };

  const status = getDaysUntilStart(trip.startDate, trip.endDate);
  const isFinished = status === 'Finished';

  return (
    <div 
      className="relative overflow-hidden rounded-3xl shadow-lg cursor-pointer flex-shrink-0"
      style={{ 
        width: '336px',
        height: 'calc(100vh - 80px)', // 上下各40px邊界
        background: '#FFFFFF',
        boxShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
      }}
      onClick={() => navigate(`/explore/${trip.id}`)}
    >
      {/* Cover Image */}
      <div className="absolute inset-0">
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Image failed to load:', trip.coverImage);
            // Fallback to a default image
            e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 p-10 flex flex-col justify-between text-white">
        {/* Trip Title */}
        <div className="text-center mt-16">
          <h2 
            className="text-6xl font-semibold mb-4"
            style={{ fontFamily: 'Crimson Text' }}
          >
            {trip.name}
          </h2>
          
          {/* Status */}
          <p 
            className="text-base mb-2 font-medium"
            style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '16px',
              lineHeight: '19px'
            }}
          >
            {status}
          </p>
          
          {/* Date Range */}
          <p 
            className="text-base font-medium"
            style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '16px',
              lineHeight: '19px'
            }}
          >
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>

        {/* View Schedule Button */}
        <div className="flex justify-center">
          <button
            className="px-8 py-3 rounded-3xl border border-white transition-colors hover:bg-white/20"
            style={{ 
              background: 'rgba(217, 217, 217, 0.76)',
              fontFamily: 'IBM Plex Mono',
              fontWeight: 500,
              fontSize: '16px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/explore/${trip.id}`);
            }}
          >
            View Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;

