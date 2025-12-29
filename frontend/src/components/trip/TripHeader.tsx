import React, { useState } from 'react';
import { ArrowLeft, MoreHorizontal, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../../types';

interface TripHeaderProps {
  trip: Trip;
  onEditTrip: () => void;
  onAddSchedule: () => void;
  onBack: () => void;
}

const TripHeader: React.FC<TripHeaderProps> = ({ trip, onEditTrip, onAddSchedule, onBack }) => {
  const navigate = useNavigate();

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="relative w-full h-[240px] flex flex-col items-center justify-center px-6 pt-4">
      {/* Background Image - Full Width Rounded Rectangle */}
      <div 
        className="w-full h-full bg-cover bg-center bg-no-repeat rounded-2xl relative overflow-hidden"
        style={{
          borderRadius: '16px'
        }}
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
        
        {/* Back Button */}
        <div 
          className="absolute top-4 left-4 w-8 h-8 bg-white/30 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer"
          style={{ zIndex: 100 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Back button clicked');
            onBack();
          }}
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </div>
        
        {/* Edit Button */}
        <div 
          className="absolute top-4 right-4 w-8 h-8 bg-white/30 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer"
          style={{ zIndex: 100 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Edit button clicked');
            onEditTrip();
          }}
        >
          <MoreHorizontal className="w-4 h-4 text-white" />
        </div>
        
        {/* Trip Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <h1 
            className="text-4xl font-semibold text-white mb-2"
            style={{ 
              fontFamily: 'Crimson Text, serif',
              fontWeight: 600,
              fontSize: '40px',
              lineHeight: '52px'
            }}
          >
            {trip.name}
          </h1>
          
          {/* Date Range */}
          <p 
            className="text-white text-sm"
            style={{ 
              fontFamily: 'SF Compact, system-ui, sans-serif',
              fontWeight: 556,
              fontSize: '14px',
              lineHeight: '17px'
            }}
          >
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripHeader;
