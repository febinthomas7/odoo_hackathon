import api from './axios';
import { mockBookings } from './mockData';
import { logActivity } from './activityLogApi';

const useMockFallback = true; 

/**
 * GET /bookings/
 * Retrieves all resource bookings.
 * Role Access: Admin, Asset Manager, Department Head (dept resources), Employee (personal bookings)
 */
export const getBookings = async () => {
  try {
    const response = await api.get('/bookings/');
    return response.data;
  } catch (error) {
    console.error("API Error (getBookings), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockBookings];
    }
    throw error;
  }
};

/**
 * POST /bookings/
 * Creates a new booking for a shared resource.
 * Role Access: Employee, Department Head, Admin
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  } catch (error) {
    console.error("API Error (createBooking), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Basic Overlap validation for mock
      const isOverlap = mockBookings.some(b => 
        b.assetId.toString() === bookingData.assetId.toString() && 
        b.date === bookingData.date &&
        b.status !== 'Cancelled' &&
        ((bookingData.startTime >= b.startTime && bookingData.startTime < b.endTime) ||
         (bookingData.endTime > b.startTime && bookingData.endTime <= b.endTime) ||
         (bookingData.startTime <= b.startTime && bookingData.endTime >= b.endTime))
      );

      if(isOverlap) {
        throw new Error("This resource is already booked for the selected time slot.");
      }

      const newBooking = {
        ...bookingData,
        id: Date.now(),
        status: 'Upcoming' // Later, an auto-transition can move this to Active when time arrives
      };
      mockBookings.push(newBooking);
      logActivity(`Created booking for ${bookingData.assetName} by ${bookingData.bookedBy}`);
      return newBooking;
    }
    throw error;
  }
};

/**
 * DELETE /bookings/:id
 * Cancels an upcoming booking.
 * Role Access: Employee (own bookings), Admin, Department Head
 */
export const cancelBooking = async (id) => {
  try {
    const response = await api.delete(`/bookings/${id}/`);
    return response.data;
  } catch (error) {
    console.error("API Error (cancelBooking), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const idx = mockBookings.findIndex(b => b.id === id);
      if (idx !== -1) {
        mockBookings[idx].status = 'Cancelled';
        logActivity(`Cancelled booking for ${mockBookings[idx].assetName} by ${mockBookings[idx].bookedBy}`);
      }
      return { success: true };
    }
    throw error;
  }
};
