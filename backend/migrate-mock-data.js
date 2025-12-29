const sqlite3 = require('sqlite3');
const { promisify } = require('util');

// Mock data from frontend
const mockTrips = [
  {
    id: 'trip-1',
    name: 'Budapest Adventure',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    coverImage: 'https://images.unsplash.com/photo-1541849546-216549ae216b?w=800',
    days: [
      {
        day: 1,
        locations: [
          {
            id: 'loc-1',
            name: 'Hungarian Parliament Building',
            address: 'Budapest, Kossuth Lajos tér 1-3, 1055 Hungary',
            placeId: 'ChIJSSYEOgTcQUcRQIRvOQa6SD8',
            coordinates: { lat: 47.5076, lng: 19.0458 },
            type: 'attraction',
            photoUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216b?w=800',
            openingHours: '08:00-18:00'
          },
          {
            id: 'loc-2',
            name: 'Buda Castle',
            address: 'Budapest, Szent György tér 2, 1014 Hungary',
            placeId: 'ChIJQ8r9lQTcQUcRGJlRPqEV5D0',
            coordinates: { lat: 47.4963, lng: 19.0400 },
            type: 'attraction',
            photoUrl: 'https://images.unsplash.com/photo-1566832790635-c3a8169a8d42?w=800',
            openingHours: '09:00-18:00'
          }
        ]
      },
      {
        day: 2,
        locations: [
          {
            id: 'loc-3',
            name: 'Uncle Lee\'s CAFE',
            address: 'Budapest, Forum 1, 1051 Hungary',
            placeId: 'mock-place-3',
            coordinates: { lat: 47.4979, lng: 19.0402 },
            type: 'cafe',
            openingHours: '08:00-18:00'
          }
        ]
      }
    ]
  },
  {
    id: 'trip-2',
    name: 'Paris Romance',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    coverImage: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
    days: [
      {
        day: 1,
        locations: [
          {
            id: 'loc-4',
            name: 'Eiffel Tower',
            address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
            placeId: 'ChIJd8BlQ2BZwokRAFQEcDlJRAI',
            coordinates: { lat: 48.8584, lng: 2.2945 },
            type: 'attraction',
            photoUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
            openingHours: '09:30-23:45'
          }
        ]
      },
      {
        day: 2,
        locations: [
          {
            id: 'loc-5',
            name: 'Louvre Museum',
            address: 'Rue de Rivoli, 75001 Paris, France',
            placeId: 'ChIJd8BlQ2BZwokRAFQEcDlJRAI2',
            coordinates: { lat: 48.8606, lng: 2.3376 },
            type: 'attraction',
            photoUrl: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800',
            openingHours: '09:00-18:00'
          },
          {
            id: 'loc-6',
            name: 'Café de Flore',
            address: '172 Bd Saint-Germain, 75006 Paris, France',
            placeId: 'ChIJd8BlQ2BZwokRAFQEcDlJRAI3',
            coordinates: { lat: 48.8542, lng: 2.3308 },
            type: 'cafe',
            openingHours: '07:00-01:30'
          }
        ]
      }
    ]
  }
];

const db = new sqlite3.Database('./database/journee.db');
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));

// Helper function to generate UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

async function migrateMockData() {
  try {
    console.log('Starting mock data migration...');
    
    // Get the test user ID
    const testUser = await dbGet('SELECT id FROM users WHERE email = ?', ['test@example.com']);
    if (!testUser) {
      console.error('Test user not found. Please create a user first.');
      return;
    }
    
    const userId = testUser.id;
    console.log(`Using user ID: ${userId}`);
    
    for (const tripData of mockTrips) {
      console.log(`Migrating trip: ${tripData.name}`);
      
      // Create trip
      const tripId = generateId();
      const createdAt = getCurrentTimestamp();
      
      await dbRun(
        `INSERT INTO trips (id, user_id, name, start_date, end_date, cover_image, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tripId, userId, tripData.name, tripData.startDate, tripData.endDate, tripData.coverImage, createdAt, createdAt]
      );
      
      console.log(`  Created trip: ${tripId}`);
      
      // Create saved locations and day schedules
      for (const dayData of tripData.days) {
        for (let i = 0; i < dayData.locations.length; i++) {
          const location = dayData.locations[i];
          
          // Create saved location
          const savedLocationId = generateId();
          await dbRun(
            `INSERT INTO saved_locations (id, user_id, trip_id, name, address, place_id, lat, lng, type, opening_hours, photo_url, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              savedLocationId,
              userId,
              tripId,
              location.name,
              location.address,
              location.placeId,
              location.coordinates.lat,
              location.coordinates.lng,
              location.type,
              location.openingHours || null,
              location.photoUrl || null,
              createdAt
            ]
          );
          
          // Create day schedule
          const dayScheduleId = generateId();
          await dbRun(
            `INSERT INTO day_schedules (id, trip_id, day_number, position, saved_location_id) 
             VALUES (?, ?, ?, ?, ?)`,
            [dayScheduleId, tripId, dayData.day, i + 1, savedLocationId]
          );
          
          console.log(`    Added location: ${location.name} to day ${dayData.day}`);
        }
      }
    }
    
    console.log('Mock data migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.close();
  }
}

migrateMockData();
