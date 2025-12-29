import React from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../../types';

interface DayEditHeaderProps {
  trip: Trip;
  currentDayIndex: number;
  onBack: () => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onAddSchedule: () => void;
  onDayChange: (index: number) => void;
}

const DayEditHeader: React.FC<DayEditHeaderProps> = ({
  trip,
  currentDayIndex,
  onBack,
  onPreviousDay,
  onNextDay,
  onAddSchedule,
  onDayChange
}) => {
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

  const currentDay = trip.days[currentDayIndex];
  const dayInfo = currentDay ? formatDate(currentDay.date) : '';

  // 生成當前週的日期
  const generateCurrentWeekDays = () => {
    if (!currentDay || !currentDay.date) {
      // 如果沒有當前天的資料，使用旅程開始日期
      const startDate = new Date(trip.startDate);
      const startOfWeek = new Date(startDate);
      
      // 找到開始日期所在週的星期一
      const dayOfWeek = startDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(startDate.getDate() + mondayOffset);
      
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weekDays.push(day);
      }
      
      return weekDays;
    }
    
    const currentDayDate = new Date(currentDay.date);
    if (isNaN(currentDayDate.getTime())) {
      // 如果日期無效，使用旅程開始日期
      const startDate = new Date(trip.startDate);
      const startOfWeek = new Date(startDate);
      
      const dayOfWeek = startDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(startDate.getDate() + mondayOffset);
      
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weekDays.push(day);
      }
      
      return weekDays;
    }
    
    const startOfWeek = new Date(currentDayDate);
    
    // 找到當前日期所在週的星期一
    const dayOfWeek = currentDayDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 週日為0，需要調整
    startOfWeek.setDate(currentDayDate.getDate() + mondayOffset);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    
    return weekDays;
  };

  const currentWeekDays = generateCurrentWeekDays();

  return (
    <div className="bg-white p-4">
      {/* Top Row - Back Button and Trip Name (Left aligned) */}
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 
          className="text-sm font-medium text-gray-600"
          style={{
            fontFamily: 'SF Compact, system-ui, sans-serif',
            fontWeight: 556,
            fontSize: '14px',
            lineHeight: '17px',
            color: '#848484'
          }}
        >
          {trip.name}
        </h1>
      </div>

      {/* Calendar View - Current Week with Navigation */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 
            className="text-sm font-medium text-gray-500 ml-2"
            style={{
              fontFamily: 'SF Compact, system-ui, sans-serif',
              fontWeight: 556,
              fontSize: '14px',
              lineHeight: '17px',
              color: '#848484',
              marginLeft: '8px'
            }}
          >
            {currentWeekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          
          {/* Week Navigation Arrows */}
          <div className="flex gap-2">
              <button
                onClick={() => {
                  // Go to previous week - find any day in the previous week
                  const prevWeekStart = new Date(currentWeekDays[0]);
                  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
                  const prevWeekEnd = new Date(prevWeekStart);
                  prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
                  
                  const tripDayIndex = trip.days.findIndex(day => {
                    const dayDate = new Date(day.date);
                    return dayDate >= prevWeekStart && dayDate <= prevWeekEnd;
                  });
                  if (tripDayIndex !== -1) {
                    onDayChange(tripDayIndex);
                  }
                }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => {
                // Go to next week - find any day in the next week
                const nextWeekStart = new Date(currentWeekDays[0]);
                nextWeekStart.setDate(nextWeekStart.getDate() + 7);
                const nextWeekEnd = new Date(nextWeekStart);
                nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
                
                const tripDayIndex = trip.days.findIndex(day => {
                  const dayDate = new Date(day.date);
                  return dayDate >= nextWeekStart && dayDate <= nextWeekEnd;
                });
                if (tripDayIndex !== -1) {
                  onDayChange(tripDayIndex);
                }
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Day headers */}
        <div className="flex gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div 
              key={day}
              className="flex-1 text-center text-xs text-gray-500 py-1"
              style={{
                fontFamily: 'SF Compact, system-ui, sans-serif',
                fontWeight: 556,
                fontSize: '12px',
                lineHeight: '14px',
                color: '#848484'
              }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid - Current Week (Numbers Only) */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {currentWeekDays.map((date, index) => {
            const dayNumber = date.getDate();
            
            // 檢查這個日期是否在旅程範圍內
            const tripDayIndex = trip.days.findIndex(day => {
              const dayDate = new Date(day.date);
              return dayDate.toDateString() === date.toDateString();
            });
            
            const isActive = tripDayIndex === currentDayIndex;
            const hasLocations = tripDayIndex !== -1 && trip.days[tripDayIndex]?.locations.length > 0;
            const isInTripRange = tripDayIndex !== -1;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <button
                  onClick={() => isInTripRange && onDayChange(tripDayIndex)}
                  disabled={!isInTripRange}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-orange-500 text-white' 
                      : hasLocations
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : isInTripRange
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  style={{
                    fontFamily: 'SF Compact, system-ui, sans-serif',
                    fontWeight: 556,
                    fontSize: '12px',
                    lineHeight: '14px'
                  }}
                >
                  {dayNumber}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Separator Line - Between calendar and DAY X */}
      <div className="border-t border-gray-200 mb-4"></div>

      {/* Day Navigation - Same format as overview */}
      <div className="flex items-center justify-between mb-1 mt-1">
        <h2 
          className="font-bold text-gray-800 ml-2"
          style={{ 
            fontFamily: 'SF Compact, system-ui, sans-serif',
            fontWeight: 656,
            fontSize: '20px',
            lineHeight: '24px',
            color: '#3A3A3A',
            marginLeft: '8px'
          }}
        >
          DAY {currentDayIndex + 1}
        </h2>
        <span 
          className="text-gray-500 mr-2"
          style={{ 
            fontFamily: 'SF Compact, system-ui, sans-serif',
            fontWeight: 556,
            fontSize: '16px',
            lineHeight: '19px',
            color: '#848484',
            marginRight: '8px'
          }}
        >
          {dayInfo}
        </span>
      </div>
    </div>
  );
};

export default DayEditHeader;
