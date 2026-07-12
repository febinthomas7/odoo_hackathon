import api from './axios';
import { mockBookings, mockAssets } from './mockData';
import { pushLog } from './activityLogApi';

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
      return mockBookings.map(b => {
         const asset = mockAssets.find(a => a.id === b.assetId);
         const employee = mockEmployees.find(e => e.id === b.bookedById);
         return {
            ...b,
            assetName: asset ? asset.name : 'Unknown Asset',
            bookedBy: employee ? employee.name : 'Unknown User'
         };
      });
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
        b.assetId === parseInt(bookingData.assetId) && 
        b.date === bookingData.date &&
        b.status !== 'Cancelled' &&
        ((bookingData.startTime >= b.startTime && bookingData.startTime < b.endTime) ||
         (bookingData.endTime > b.startTime && bookingData.endTime <= b.endTime))
      );

      if(isOverlap) {
        throw new Error("This resource is already booked for the selected time slot.");
      }

      const newBooking = {
        ...bookingData,
        id: Date.now(),
        status: 'Upcoming'
      };
      mockBookings.push(newBooking);
      
      const asset = mockAssets.find(a => a.id === parseInt(bookingData.assetId));
      await pushLog(bookingData.bookedById, `Booked ${asset?.name} for ${bookingData.date}`);
      
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
export const cancelBooking = async (id, userId) => {
  try {
    const response = await api.delete(`/bookings/${id}/`);
    return response.data;
  } catch (error) {
    console.error("API Error (cancelBooking), falling back to mock:", error);
    if (useMockFallback) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const booking = mockBookings.find(b => b.id === id);
      if(booking) {
        booking.status = 'Cancelled';
        const asset = mockAssets.find(a => a.id === booking.assetId);
        await pushLog(userId, `Cancelled booking for ${asset?.name} on ${booking.date}`);
      }
      return { success: true };
    }
    throw error;
  }
};
