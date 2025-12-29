import { Trip, User, Location } from '../types';

// Mock user
export const mockUser: User = {
  id: 'user-1',
  email: 'demo@journee.com',
  username: 'Demo User',
  createdAt: new Date().toISOString(),
};

// Mock locations for Budapest
const budapestLocations: Location[] = [
  {
    id: 'loc-1',
    name: 'Hungarian Parliament Building',
    address: 'Budapest, Kossuth Lajos tér 1-3, 1055 Hungary',
    placeId: 'ChIJSSYEOgTcQUcRQIRvOQa6SD8',
    coordinates: { lat: 47.5076, lng: 19.0458 },
    type: 'attraction',
    photoUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216b?w=800',
    rating: 4.8,
  },
  {
    id: 'loc-2',
    name: 'Buda Castle',
    address: 'Budapest, Szent György tér 2, 1014 Hungary',
    placeId: 'ChIJQ8r9lQTcQUcRGJlRPqEV5D0',
    coordinates: { lat: 47.4963, lng: 19.0400 },
    type: 'attraction',
    photoUrl: 'https://images.unsplash.com/photo-1566832790635-c3a8169a8d42?w=800',
    rating: 4.7,
  },
  {
    id: 'loc-3',
    name: 'Uncle Lee\'s CAFE',
    address: 'Budapest, Forum 1, 1051 Hungary',
    placeId: 'mock-place-3',
    coordinates: { lat: 47.4979, lng: 19.0402 },
    type: 'cafe',
    openingHours: '8:00-18:00',
    rating: 4.5,
  },
];

// Mock locations for Paris
const parisLocations: Location[] = [
  {
    id: 'loc-4',
    name: 'Eiffel Tower',
    address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
    placeId: 'ChIJLU7jZClu5kcR4PcOOO6p3I0',
    coordinates: { lat: 48.8584, lng: 2.2945 },
    type: 'attraction',
    photoUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
    rating: 4.9,
  },
  {
    id: 'loc-5',
    name: 'Le Comptoir du Relais',
    address: '9 Carrefour de l\'Odéon, 75006 Paris, France',
    placeId: 'mock-place-5',
    coordinates: { lat: 48.8522, lng: 2.3376 },
    type: 'restaurant',
    rating: 4.6,
    openingHours: '12:00-14:30, 19:00-23:00',
  },
];

// Mock locations for Lucerne
const lucerneLocations: Location[] = [
  {
    id: 'loc-6',
    name: 'Chapel Bridge',
    address: 'Kapellbrücke, 6002 Luzern, Switzerland',
    placeId: 'mock-place-6',
    coordinates: { lat: 47.0502, lng: 8.3093 },
    type: 'attraction',
    rating: 4.8,
  },
  {
    id: 'loc-7',
    name: 'Hotel Schweizerhof',
    address: 'Schweizerhofquai 3, 6002 Luzern, Switzerland',
    placeId: 'mock-place-7',
    coordinates: { lat: 47.0514, lng: 8.3081 },
    type: 'accommodation',
    rating: 4.5,
  },
];

// Mock locations for Tokyo
const tokyoLocations: Location[] = [
  {
    id: 'loc-8',
    name: 'Sensoji Temple',
    address: '2-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan',
    placeId: 'mock-place-8',
    coordinates: { lat: 35.7148, lng: 139.7967 },
    type: 'attraction',
    rating: 4.7,
  },
  {
    id: 'loc-9',
    name: 'Tsukiji Fish Market',
    address: '5-2-1 Tsukiji, Chuo City, Tokyo 104-0045, Japan',
    placeId: 'mock-place-9',
    coordinates: { lat: 35.6654, lng: 139.7706 },
    type: 'restaurant',
    rating: 4.4,
    openingHours: '5:00-10:00',
  },
  {
    id: 'loc-10',
    name: 'Blue Bottle Coffee',
    address: '1-4-8 Kiyosumi, Koto City, Tokyo 135-0024, Japan',
    placeId: 'mock-place-10',
    coordinates: { lat: 35.6820, lng: 139.7984 },
    type: 'cafe',
    rating: 4.3,
    openingHours: '8:00-19:00',
  },
];

// Mock trips
export const mockTrips: Trip[] = [
  {
    id: 'trip-1',
    name: 'Budapest',
    startDate: '2025-10-22',
    endDate: '2025-11-08',
    coverImage: 'https://images.unsplash.com/photo-1568457024808-ecc6d8414594?auto=format&fit=crop&w=800&q=80',
    userId: 'user-1',
    createdAt: '2025-10-19T00:00:00.000Z',
    updatedAt: '2025-10-22T00:00:00.000Z',
    days: [
      {
        day: 1,
        date: '2025-10-22',
        locations: budapestLocations,
      },
      {
        day: 2,
        date: '2025-10-23',
        locations: [],
      },
      {
        day: 3,
        date: '2025-10-24',
        locations: [],
      },
      {
        day: 4,
        date: '2025-10-25',
        locations: [],
      },
      {
        day: 5,
        date: '2025-10-26',
        locations: [],
      },
      {
        day: 6,
        date: '2025-10-27',
        locations: [],
      },
      {
        day: 7,
        date: '2025-10-28',
        locations: [],
      },
      {
        day: 8,
        date: '2025-10-29',
        locations: [],
      },
      {
        day: 9,
        date: '2025-10-30',
        locations: [],
      },
      {
        day: 10,
        date: '2025-10-31',
        locations: [],
      },
      {
        day: 11,
        date: '2025-11-01',
        locations: [],
      },
      {
        day: 12,
        date: '2025-11-02',
        locations: [],
      },
      {
        day: 13,
        date: '2025-11-03',
        locations: [],
      },
      {
        day: 14,
        date: '2025-11-04',
        locations: [],
      },
      {
        day: 15,
        date: '2025-11-05',
        locations: [],
      },
      {
        day: 16,
        date: '2025-11-06',
        locations: [],
      },
      {
        day: 17,
        date: '2025-11-07',
        locations: [],
      },
      {
        day: 18,
        date: '2025-11-08',
        locations: [],
      },
    ],
  },
  {
    id: 'trip-2',
    name: 'Paris',
    startDate: '2025-12-19',
    endDate: '2025-12-28',
    coverImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
    userId: 'user-1',
    createdAt: '2025-10-15T00:00:00.000Z',
    updatedAt: '2025-10-20T00:00:00.000Z',
    days: [
      {
        day: 1,
        date: '2025-12-19',
        locations: parisLocations,
      },
      {
        day: 2,
        date: '2025-12-20',
        locations: [],
      },
      {
        day: 3,
        date: '2025-12-21',
        locations: [],
      },
      {
        day: 4,
        date: '2025-12-22',
        locations: [],
      },
      {
        day: 5,
        date: '2025-12-23',
        locations: [],
      },
      {
        day: 6,
        date: '2025-12-24',
        locations: [],
      },
      {
        day: 7,
        date: '2025-12-25',
        locations: [],
      },
      {
        day: 8,
        date: '2025-12-26',
        locations: [],
      },
      {
        day: 9,
        date: '2025-12-27',
        locations: [],
      },
      {
        day: 10,
        date: '2025-12-28',
        locations: [],
      },
    ],
  },
  {
    id: 'trip-3',
    name: 'Lucerne',
    startDate: '2025-10-22',
    endDate: '2025-11-01',
    coverImage: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=800',
    userId: 'user-1',
    createdAt: '2025-10-10T00:00:00.000Z',
    updatedAt: '2025-10-22T00:00:00.000Z',
    days: [
      {
        day: 1,
        date: '2025-10-22',
        locations: lucerneLocations,
      },
      {
        day: 2,
        date: '2025-10-23',
        locations: [],
      },
      {
        day: 3,
        date: '2025-10-24',
        locations: [],
      },
      {
        day: 4,
        date: '2025-10-25',
        locations: [],
      },
      {
        day: 5,
        date: '2025-10-26',
        locations: [],
      },
      {
        day: 6,
        date: '2025-10-27',
        locations: [],
      },
      {
        day: 7,
        date: '2025-10-28',
        locations: [],
      },
      {
        day: 8,
        date: '2025-10-29',
        locations: [],
      },
      {
        day: 9,
        date: '2025-10-30',
        locations: [],
      },
      {
        day: 10,
        date: '2025-10-31',
        locations: [],
      },
      {
        day: 11,
        date: '2025-11-01',
        locations: [],
      },
    ],
  },
  {
    id: 'trip-4',
    name: 'Tokyo',
    startDate: '2025-11-15',
    endDate: '2025-11-25',
    coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000',
    userId: 'user-1',
    createdAt: '2025-10-25T00:00:00.000Z',
    updatedAt: '2025-10-25T00:00:00.000Z',
    days: [
      {
        day: 1,
        date: '2025-11-15',
        locations: tokyoLocations,
      },
      {
        day: 2,
        date: '2025-11-16',
        locations: [],
      },
      {
        day: 3,
        date: '2025-11-17',
        locations: [],
      },
      {
        day: 4,
        date: '2025-11-18',
        locations: [],
      },
      {
        day: 5,
        date: '2025-11-19',
        locations: [],
      },
      {
        day: 6,
        date: '2025-11-20',
        locations: [],
      },
      {
        day: 7,
        date: '2025-11-21',
        locations: [],
      },
      {
        day: 8,
        date: '2025-11-22',
        locations: [],
      },
      {
        day: 9,
        date: '2025-11-23',
        locations: [],
      },
      {
        day: 10,
        date: '2025-11-24',
        locations: [],
      },
      {
        day: 11,
        date: '2025-11-25',
        locations: [],
      },
    ],
  },
];

// LocalStorage keys
const STORAGE_KEYS = {
  USER: 'journee_user',
  TRIPS: 'journee_trips',
  AUTH_TOKEN: 'authToken',
};

// Initialize localStorage with mock data if empty
export const initializeMockData = (): void => {
  // Clear existing data to ensure fresh data
  localStorage.removeItem(STORAGE_KEYS.TRIPS);
  localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(mockTrips));
};

// Mock API functions using localStorage
export const mockAuthApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Simple mock validation
    if (email && password) {
      const token = 'mock-jwt-token-' + Date.now();
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return { user: mockUser, token };
    }
    throw new Error('Invalid credentials');
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  getCurrentUser: async (): Promise<User | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const mockTripApi = {
  getAll: async (): Promise<Trip[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const tripsStr = localStorage.getItem(STORAGE_KEYS.TRIPS);
    return tripsStr ? JSON.parse(tripsStr) : [];
  },

  getById: async (id: string): Promise<Trip | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const tripsStr = localStorage.getItem(STORAGE_KEYS.TRIPS);
    const trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
    return trips.find((trip) => trip.id === id) || null;
  },

  create: async (trip: Omit<Trip, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Trip> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const tripsStr = localStorage.getItem(STORAGE_KEYS.TRIPS);
    const trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
    
    const newTrip: Trip = {
      ...trip,
      id: 'trip-' + Date.now(),
      userId: mockUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    trips.push(newTrip);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    return newTrip;
  },

  update: async (id: string, updates: Partial<Trip>): Promise<Trip | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const tripsStr = localStorage.getItem(STORAGE_KEYS.TRIPS);
    const trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
    
    const index = trips.findIndex((trip) => trip.id === id);
    if (index === -1) return null;
    
    trips[index] = {
      ...trips[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    return trips[index];
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const tripsStr = localStorage.getItem(STORAGE_KEYS.TRIPS);
    const trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
    
    const filteredTrips = trips.filter((trip) => trip.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(filteredTrips));
    return true;
  },

  addLocationToDay: async (tripId: string, dayNumber: number, location: Location): Promise<Trip | null> => {
    const tripsStr = localStorage.getItem(STORAGE_KEYS.TRIPS);
    const trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
    
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return null;
    
    const day = trip.days.find((d) => d.day === dayNumber);
    if (!day) return null;
    
    day.locations.push(location);
    trip.updatedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    return trip;
  },

  removeLocationFromDay: async (tripId: string, dayNumber: number, locationId: string): Promise<Trip | null> => {
    const tripsStr = localStorage.getItem(STORAGE_KEYS.TRIPS);
    const trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
    
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return null;
    
    const day = trip.days.find((d) => d.day === dayNumber);
    if (!day) return null;
    
    day.locations = day.locations.filter((loc) => loc.id !== locationId);
    trip.updatedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    return trip;
  },

  reorderLocationsInDay: async (tripId: string, dayNumber: number, locations: Location[]): Promise<Trip | null> => {
    const tripsStr = localStorage.getItem(STORAGE_KEYS.TRIPS);
    const trips: Trip[] = tripsStr ? JSON.parse(tripsStr) : [];
    
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return null;
    
    const day = trip.days.find((d) => d.day === dayNumber);
    if (!day) return null;
    
    day.locations = locations;
    trip.updatedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    return trip;
  },
};

