// Location types
export type LocationType = 'restaurant' | 'cafe' | 'accommodation' | 'attraction';

export interface Location {
  id: string;
  name: string;
  address: string;
  placeId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: LocationType;
  openingHours?: string;
  photoUrl?: string;
  rating?: number;
  phoneNumber?: string;
}

// Day schedule
export interface DaySchedule {
  day: number;
  date: string;
  locations: Location[];
}

// Trip
export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  days: DaySchedule[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// User
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

// Auth context
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, username: string, password: string) => Promise<void>;
}

// Trip context
export interface TripContextType {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;
  fetchTrips: () => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  createTrip: (trip: CreateTripRequest) => Promise<Trip>;
  updateTrip: (id: string, trip: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addLocationToDay: (tripId: string, dayNumber: number, location: Location) => Promise<void>;
  removeLocationFromDay: (tripId: string, dayNumber: number, locationId: string) => Promise<void>;
  reorderLocationsInDay: (tripId: string, dayNumber: number, locations: Location[]) => Promise<void>;
}

// Request types
export interface CreateTripRequest {
  name: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
}

// Google Maps
export interface MapConfig {
  center: google.maps.LatLngLiteral;
  zoom: number;
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type: LocationType;
  rating?: number;
  photoUrl?: string;
  openingHours?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

