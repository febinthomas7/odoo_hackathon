import api from './axios';
import { mockBookings } from './mockData';

const useMockFallback = true; 

let localBookings = [...mockBookings];

export const getBookings = async () => {
  try {
    const response = await api.get('/bookings/');
    return response.data;
  } catch (error) {
    console.error("API Error (getBookings), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return localBookings;
    }
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  } catch (error) {
    console.error("API Error (createBooking), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Overlap Validation
      const hasOverlap = localBookings.some(b => {
        if (b.assetId.toString() !== bookingData.assetId.toString() || b.date !== bookingData.date || b.status === 'Cancelled') {
          return false;
        }
        // Check time overlap
        return (bookingData.startTime < b.endTime && bookingData.endTime > b.startTime);
      });

      if (hasOverlap) {
        throw new Error("This resource is already booked for the selected time slot.");
      }

      const newBooking = {
        ...bookingData,
        id: Date.now(),
        status: 'Upcoming',
      };
      localBookings.push(newBooking);
      return newBooking;
    }
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/cancel/`);
    return response.data;
  } catch (error) {
    console.error("API Error (cancelBooking), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      localBookings = localBookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b);
      return { success: true };
    }
    throw error;
  }
};
