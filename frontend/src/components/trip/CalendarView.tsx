import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Trip } from '../../types';

interface CalendarViewProps {
  trip: Trip;
  currentDayIndex: number;
  onDayChange: (index: number) => void;
  onAddSchedule: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  trip, 
  currentDayIndex, 
  onDayChange, 
  onAddSchedule 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      year: date.getFullYear(),
      fullDate: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\//g, '/')
    };
  };

  const currentDay = trip.days[currentDayIndex];
  const dayInfo = currentDay ? formatDate(currentDay.date) : null;

  return (
    <div className="space-y-6">
      {/* Month Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {dayInfo?.month} {dayInfo?.year}
        </h2>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center text-xs text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {/* Day Numbers */}
        {trip.days.map((day, index) => {
          const dayData = formatDate(day.date);
          const isSelected = index === currentDayIndex;
          
          return (
            <button
              key={day.day}
              onClick={() => onDayChange(index)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${isSelected 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {dayData.day}
            </button>
          );
        })}
      </div>

      {/* Day Info */}
      {dayInfo && (
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-gray-800">
            DAY {currentDayIndex + 1}
          </h3>
          <p className="text-sm text-gray-600">
            {dayInfo.fullDate}
          </p>
        </div>
      )}

      {/* Add Schedule Button */}
      <div className="text-center">
        <button
          onClick={onAddSchedule}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          Add Schedule
        </button>
      </div>
    </div>
  );
};

export default CalendarView;
