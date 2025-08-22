import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import type { WorkLocation } from '@/types';

export function useGeofencing() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === Location.PermissionStatus.GRANTED) {
        setIsLocationEnabled(true);
        await getCurrentLocation();
      }
    } catch (err) {
      console.error('Error checking location permission:', err);
      setError('Failed to check location permission');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === Location.PermissionStatus.GRANTED) {
        setIsLocationEnabled(true);
        await getCurrentLocation();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('Failed to request location permission');
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    try {
      if (Platform.OS === 'web') {
        // Web fallback using browser geolocation
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const webLocation: Location.LocationObject = {
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  altitude: position.coords.altitude,
                  accuracy: position.coords.accuracy,
                  altitudeAccuracy: position.coords.altitudeAccuracy,
                  heading: position.coords.heading,
                  speed: position.coords.speed,
                },
                timestamp: position.timestamp,
              };
              setLocation(webLocation);
              resolve(webLocation);
            },
            (error) => {
              console.error('Web geolocation error:', error);
              setError('Failed to get location');
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            }
          );
        });
      } else {
        // Native location using expo-location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
        });
        setLocation(currentLocation);
        return currentLocation;
      }
    } catch (err) {
      console.error('Error getting current location:', err);
      setError('Failed to get current location');
      return null;
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const isWithinGeofence = (
    currentLat: number,
    currentLon: number,
    workLocation: WorkLocation
  ): boolean => {
    const distance = calculateDistance(
      currentLat,
      currentLon,
      workLocation.latitude,
      workLocation.longitude
    );
    return distance <= workLocation.radius;
  };

  const checkGeofenceStatus = async (
    workLocations: WorkLocation[]
  ): Promise<{
    isInside: boolean;
    location: WorkLocation | null;
    distance: number | null;
  }> => {
    if (!location || workLocations.length === 0) {
      return { isInside: false, location: null, distance: null };
    }

    for (const workLocation of workLocations) {
      if (!workLocation.isActive) continue;

      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        workLocation.latitude,
        workLocation.longitude
      );

      if (distance <= workLocation.radius) {
        return { isInside: true, location: workLocation, distance };
      }
    }

    // Find the closest work location
    let closestLocation = workLocations[0];
    let closestDistance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      closestLocation.latitude,
      closestLocation.longitude
    );

    for (let i = 1; i < workLocations.length; i++) {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        workLocations[i].latitude,
        workLocations[i].longitude
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestLocation = workLocations[i];
      }
    }

    return { isInside: false, location: closestLocation, distance: closestDistance };
  };

  const startLocationTracking = async (
    workLocations: WorkLocation[],
    onGeofenceEnter: (location: WorkLocation) => void,
    onGeofenceExit: (location: WorkLocation) => void
  ) => {
    if (Platform.OS === 'web') {
      console.log('Location tracking not fully supported on web');
      return;
    }

    try {
      // Request background location permission for continuous tracking
      const { status } = await Location.requestBackgroundPermissionsAsync();
      
      if (status !== Location.PermissionStatus.GRANTED) {
        console.log('Background location permission not granted');
        return;
      }

      // Start location updates
      await Location.startLocationUpdatesAsync('geofence-task', {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // Check every 30 seconds
        distanceInterval: 50, // Or when moved 50 meters
        foregroundService: {
          notificationTitle: 'Tracking work location',
          notificationBody: 'App is monitoring your location for automatic clock in/out',
        },
      });

      console.log('Location tracking started');
    } catch (err) {
      console.error('Error starting location tracking:', err);
      setError('Failed to start location tracking');
    }
  };

  const stopLocationTracking = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync('geofence-task');
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync('geofence-task');
        console.log('Location tracking stopped');
      }
    } catch (err) {
      console.error('Error stopping location tracking:', err);
    }
  };

  const reverseGeocode = async (
    latitude: number,
    longitude: number
  ): Promise<string | null> => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result.length > 0) {
        const address = result[0];
        return `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
      }
      return null;
    } catch (err) {
      console.error('Error reverse geocoding:', err);
      return null;
    }
  };

  return {
    location,
    locationPermission,
    isLocationEnabled,
    isLoading,
    error,
    requestLocationPermission,
    getCurrentLocation,
    calculateDistance,
    isWithinGeofence,
    checkGeofenceStatus,
    startLocationTracking,
    stopLocationTracking,
    reverseGeocode,
  };
}