import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Location } from '../../types';
import LocationCard from '../location/LocationCard';

interface SortableLocationCardProps {
  location: Location;
  index: number;
  onRemove: () => void;
  onClick?: () => void;
}

const SortableLocationCard: React.FC<SortableLocationCardProps> = ({
  location,
  index,
  onRemove,
  onClick,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: location.id,
    data: {
      type: 'location',
      location,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : `transform ${transition || '250ms'} ease`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : 'z-0'}`}
    >
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </button>

        {/* Location card */}
        <div className="flex-1">
          <LocationCard
            location={location}
            index={index}
            showRemove={true}
            onRemove={onRemove}
            isDragging={isDragging}
            onClick={onClick}
          />
        </div>
      </div>
    </div>
  );
};

export default SortableLocationCard;

