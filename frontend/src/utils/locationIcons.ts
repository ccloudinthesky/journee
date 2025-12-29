import { Utensils, Coffee, Bed, Landmark } from 'lucide-react';

export const getLocationIcon = (type: string) => {
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