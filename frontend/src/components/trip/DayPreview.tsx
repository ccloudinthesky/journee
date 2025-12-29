import React from 'react';
import { Location } from '../../types';
import { getLocationIcon } from '../../utils/locationIcons';

interface DayPreviewProps {
  dayNumber: number;
  date: string;
  locations: Location[];
  onClick: () => void;
}

const DayPreview: React.FC<DayPreviewProps> = ({ dayNumber, date, locations, onClick }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/');
  };

  return (
    <div 
      className="w-full bg-white rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out relative group"
      onClick={onClick}
      style={{
        boxShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)',
        borderRadius: '16px',
        padding: locations.length === 0 ? '16px' : '24px', // 動態調整 padding
        minHeight: locations.length === 0 ? '80px' : 'auto' // 空行程日的最小高度
      }}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="font-bold text-gray-800"
          style={{ 
            fontFamily: 'SF Compact, system-ui, sans-serif',
            fontWeight: 656,
            fontSize: '20px',
            lineHeight: '24px',
            color: '#3A3A3A'
          }}
        >
          DAY {dayNumber}
        </h3>
        <span 
          className="text-gray-500"
          style={{ 
            fontFamily: 'SF Compact, system-ui, sans-serif',
            fontWeight: 556,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#848484'
          }}
        >
          {formatDate(date)}
        </span>
      </div>

      {/* Locations List with Timeline */}
      <div className="relative">
        {locations.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p 
              className="text-sm"
              style={{ 
                fontFamily: 'SF Compact, system-ui, sans-serif',
                fontWeight: 556,
                fontSize: '14px',
                lineHeight: '17px',
                color: '#848484'
              }}
            >
              No locations added yet
            </p>
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div 
              className="absolute w-0.5"
              style={{
                background: '#D9D9D9',
                left: '16px', // Center of 32px circle (16px radius)
                top: '16px', // Start from first circle center
                bottom: '16px', // End at last circle center
              }}
            />
            
            {locations.map((location, index) => {
              const IconComponent = getLocationIcon(location.type);
              return (
                <div key={location.id} className="relative flex items-start gap-4 mb-4">
                  {/* Timeline Circle with Icon */}
                  <div 
                    className="w-8 h-8 rounded-full flex-shrink-0 relative z-10 flex items-center justify-center"
                    style={{ 
                      backgroundColor: '#D9D9D9',
                      width: '32px',
                      height: '32px',
                      marginTop: '0px' // Align with text baseline
                    }}
                  >
                    <IconComponent 
                      className="w-4 h-4 text-gray-600" 
                      style={{ color: '#6B7280' }}
                    />
                  </div>
                  
                  {/* Location Info */}
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-medium text-gray-800 truncate"
                      style={{ 
                        fontFamily: 'SF Compact, system-ui, sans-serif',
                        fontWeight: 556,
                        fontSize: '14px',
                        lineHeight: '17px',
                        color: '#3A3A3A',
                        marginTop: '4px' // Align with circle center
                      }}
                    >
                      {location.name}
                    </h4>
                    <p 
                      className="text-gray-500 text-xs truncate"
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
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default DayPreview;
