// Database types
export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  end_date: string;
  cover_image?: string;
  created_at: string;
  updated_at: string;
}

export interface DaySchedule {
  id: string;
  trip_id: string;
  day_number: number;
  position: number;
  saved_location_id: string;
}

export interface SavedLocation {
  id: string;
  user_id: string;
  trip_id: string;
  name: string;
  address: string;
  place_id: string;
  lat: number;
  lng: number;
  type: 'restaurant' | 'cafe' | 'accommodation' | 'attraction';
  opening_hours?: string;
  photo_url?: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface RegisterResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

// Request types
export interface CreateTripRequest {
  name: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
}

export interface UpdateTripRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  coverImage?: string;
  days?: DaySchedule[];
}

export interface CreateSavedLocationRequest {
  tripId: string;
  name: string;
  address: string;
  placeId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'restaurant' | 'cafe' | 'accommodation' | 'attraction';
  openingHours?: string;
  photoUrl?: string;
}

// Google Maps types
export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: 'restaurant' | 'cafe' | 'accommodation' | 'attraction';
  rating?: number;
  photoUrl?: string;
  openingHours?: string;
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}
