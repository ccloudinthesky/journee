import React from 'react';
import { Location } from '../../types';
import { getLocationIcon } from '../../utils/locationIcons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableLocationItemProps {
  location: Location;
  index: number;
  onRemove: () => void;
  onLocationHover?: (location: Location | null) => void;
}

const SortableLocationItem: React.FC<SortableLocationItemProps> = ({
  location,
  index,
  onRemove,
  onLocationHover,
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
    animateLayoutChanges: () => false,
  });

  const IconComponent = getLocationIcon(location.type);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'transform 0ms' : transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="relative flex items-center gap-4 mb-4 group transition-all duration-200"
      onMouseEnter={() => onLocationHover && onLocationHover(location)}
      onMouseLeave={() => onLocationHover && onLocationHover(null)}
    >
      {/* Extended hover area using pseudo-element */}
      <div className="absolute inset-0 -my-1 -mx-4 px-4 rounded-lg opacity-0 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none" 
           style={{ backgroundColor: '#EBCFC3' }}></div>
      
      {/* Timeline Circle with Icon */}
      <div 
        className="w-8 h-8 rounded-full flex-shrink-0 relative z-20 flex items-center justify-center"
        style={{ 
          backgroundColor: '#D9D9D9',
          width: '32px',
          height: '32px'
        }}
      >
        <IconComponent 
          className="w-4 h-4 text-gray-600" 
          style={{ color: '#6B7280' }}
        />
      </div>
      
      {/* Location Info */}
      <div className="flex-1 min-w-0 min-h-[48px] flex flex-col justify-center relative z-20">
        <h4 
          className="font-medium text-gray-800 truncate"
          style={{ 
            fontFamily: 'SF Compact, system-ui, sans-serif',
            fontWeight: 556,
            fontSize: '14px',
            lineHeight: '17px',
            color: '#3A3A3A',
            marginTop: '0px'
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

      {/* Remove button - only visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-all opacity-0 group-hover:opacity-100 relative z-20"
        aria-label="Remove location"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

interface DayEditLocationsProps {
  locations: Location[];
  onDragEnd: (event: DragEndEvent) => void;
  onRemoveLocation: (locationId: string) => void;
  onLocationHover?: (location: Location | null) => void;
}

const DayEditLocations: React.FC<DayEditLocationsProps> = ({
  locations,
  onDragEnd,
  onRemoveLocation,
  onLocationHover,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="relative">
      {locations.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
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
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={() => {
              document.documentElement.style.setProperty('--dnd-transition-duration', '0ms');
            }}
            onDragEnd={(event) => {
              document.documentElement.style.setProperty('--dnd-transition-duration', '');
              onDragEnd(event);
            }}
          >
            <SortableContext
              items={locations.map((loc) => loc.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {locations.map((location, index) => (
                  <SortableLocationItem
                    key={location.id}
                    location={location}
                    index={index}
                    onRemove={() => onRemoveLocation(location.id)}
                    onLocationHover={onLocationHover}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
};

export default DayEditLocations;
