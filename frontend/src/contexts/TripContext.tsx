import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Trip, TripContextType, Location, CreateTripRequest } from '../types';
import { tripApi } from '../services/api';

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripApi.getAll();
      if (response.success && response.data) {
        setTrips(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trips');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrip = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setCurrentTrip(null); // Clear current trip at start
    try {
      const response = await tripApi.getById(id);
      if (response.success && response.data) {
        const trip = response.data;
        setCurrentTrip(trip);
        // Also update the trips array to ensure TripSidebar can find the trip
        setTrips((prev) => {
          const existingIndex = prev.findIndex((t) => t.id === id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = trip;
            return updated;
          } else {
            return [...prev, trip];
          }
        });
      } else {
        setError('Trip not found');
        setCurrentTrip(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trip');
      setCurrentTrip(null);
      console.error('Error fetching trip:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = async (
    trip: CreateTripRequest
  ): Promise<Trip> => {
    setLoading(true);
    setError(null);
    try {
      // Create trip via API
      const response = await tripApi.create(trip);
      if (response.success && response.data) {
        const newTrip = response.data;
        setTrips((prev) => [...prev, newTrip]);
        return newTrip;
      }
      throw new Error('Failed to create trip');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trip');
      console.error('Error creating trip:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (id: string, updates: Partial<Trip>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripApi.update(id, updates);
      if (response.success && response.data) {
        const updatedTrip = response.data;
        setTrips((prev) =>
          prev.map((trip) => (trip.id === id ? updatedTrip : trip))
        );
        if (currentTrip?.id === id) {
          setCurrentTrip(updatedTrip);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update trip');
      console.error('Error updating trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await tripApi.delete(id);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
      if (currentTrip?.id === id) {
        setCurrentTrip(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trip');
      console.error('Error deleting trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLocationToDay = async (
    tripId: string,
    dayNumber: number,
    location: Location
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripApi.addLocationToDay(tripId, dayNumber, location);
      if (response.success && response.data) {
        const updatedTrip = response.data;
        setTrips((prev) =>
          prev.map((trip) => (trip.id === tripId ? updatedTrip : trip))
        );
        if (currentTrip?.id === tripId) {
          setCurrentTrip(updatedTrip);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add location');
      console.error('Error adding location:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeLocationFromDay = async (
    tripId: string,
    dayNumber: number,
    locationId: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tripApi.removeLocationFromDay(tripId, dayNumber, locationId);
      if (response.success && response.data) {
        const updatedTrip = response.data;
        setTrips((prev) =>
          prev.map((trip) => (trip.id === tripId ? updatedTrip : trip))
        );
        if (currentTrip?.id === tripId) {
          setCurrentTrip(updatedTrip);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove location');
      console.error('Error removing location:', err);
    } finally {
      setLoading(false);
    }
  };

  const reorderLocationsInDay = async (
    tripId: string,
    dayNumber: number,
    locations: Location[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const locationIds = locations.map(loc => loc.id);
      const response = await tripApi.reorderLocationsInDay(tripId, dayNumber, locationIds);
      if (response.success && response.data) {
        const updatedTrip = response.data;
        setTrips((prev) =>
          prev.map((trip) => (trip.id === tripId ? updatedTrip : trip))
        );
        if (currentTrip?.id === tripId) {
          setCurrentTrip(updatedTrip);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder locations');
      console.error('Error reordering locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const value: TripContextType = {
    trips,
    currentTrip,
    loading,
    error,
    fetchTrips,
    fetchTrip,
    createTrip,
    updateTrip,
    deleteTrip,
    addLocationToDay,
    removeLocationFromDay,
    reorderLocationsInDay,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};

