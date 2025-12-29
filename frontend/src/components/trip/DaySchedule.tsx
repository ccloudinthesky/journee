import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DaySchedule as DayScheduleType, Location } from '../../types';
import SortableLocationCard from './SortableLocationCard';

interface DayScheduleProps {
  daySchedule: DayScheduleType;
  onRemoveLocation: (locationId: string) => void;
}

const DaySchedule: React.FC<DayScheduleProps> = ({
  daySchedule,
  onRemoveLocation,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${daySchedule.day}`,
    data: {
      type: 'day',
      dayNumber: daySchedule.day,
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          DAY {daySchedule.day}
        </h3>
        <span className="text-sm text-gray-500">{formatDate(daySchedule.date)}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[100px] rounded-lg border-2 border-dashed transition-colors ${
          isOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        {daySchedule.locations.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            Drag locations here to add to this day
          </div>
        ) : (
          <SortableContext
            items={daySchedule.locations.map((loc) => loc.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-3 space-y-2">
              {daySchedule.locations.map((location, index) => (
                <SortableLocationCard
                  key={location.id}
                  location={location}
                  index={index}
                  onRemove={() => onRemoveLocation(location.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
};

export default DaySchedule;

