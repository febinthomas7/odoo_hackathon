import React, { useState, useEffect } from 'react';
import { getBookings, createBooking, cancelBooking } from '../../api/bookingApi';
import { getAssets } from '../../api/assetApi';
import { getEmployees } from '../../api/organizationApi';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

const ResourceBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookData, assetsData, empData] = await Promise.all([
        getBookings(),
        getAssets(), // To list bookable assets
        getEmployees() // To list users who book
      ]);
      setBookings(bookData);
      setAssets(assetsData.filter(a => a.shared)); // Only show shared/bookable assets
      setEmployees(empData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id) => {
    if(window.confirm('Are you sure you want to cancel this booking?')) {
      await cancelBooking(id);
      loadData();
    }
  };

  return (
    <div className="w-full">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 min-h-[500px]">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Resource Bookings</h3>
            <p className="text-sm text-slate-400 mt-1">Manage reservations for shared assets like meeting rooms and vehicles.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20">
            <PlusIcon /> Book Resource
          </button>
        </div>
        
        <div className="mb-6 bg-slate-800/40 border border-slate-700 p-6 rounded-xl flex items-center justify-center min-h-[150px]">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-500 mb-3"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            <h4 className="text-white font-bold text-lg">Interactive Calendar View</h4>
            <p className="text-slate-400 text-sm mt-1">Calendar UI module will be injected here. For now, use the list below.</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Resource</th>
                <th className="px-6 py-4 font-semibold">Booked By</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading bookings...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No bookings found.</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{booking.assetName}</td>
                    <td className="px-6 py-4 font-medium text-indigo-300">{booking.bookedBy}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{booking.date}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.startTime} - {booking.endTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        booking.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        booking.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        booking.status === 'Ongoing' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20' // Cancelled
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === 'Upcoming' && (
                        <button onClick={() => handleCancel(booking.id)} className="text-red-400 hover:text-red-300 font-medium text-sm">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <BookingModal 
          assets={assets} 
          employees={employees} 
          onClose={() => { setShowModal(false); setErrorMsg(''); }} 
          onComplete={loadData} 
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
        />
      )}
    </div>
  );
};

const BookingModal = ({ assets, employees, onClose, onComplete, errorMsg, setErrorMsg }) => {
  const [formData, setFormData] = useState({ assetId: '', bookedById: '', date: '', startTime: '', endTime: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if(formData.startTime >= formData.endTime) {
      setErrorMsg("End time must be after start time.");
      return;
    }

    try {
      await createBooking({
        ...formData,
        assetId: parseInt(formData.assetId),
        bookedById: parseInt(formData.bookedById)
      });
      onComplete();
      onClose();
    } catch (error) {
      setErrorMsg(error.message || "Failed to create booking.");
    }
  };

  return (
    <Modal title="Book a Resource" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Select Resource</label>
          <select required value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
            <option value="">Select...</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Booked By</label>
          <select required value={formData.bookedById} onChange={e => setFormData({...formData, bookedById: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500">
            <option value="">Select Employee...</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Date</label>
          <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Start Time</label>
            <input required type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">End Time</label>
            <input required type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
          </div>
        </div>
        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg mt-6 shadow-lg shadow-indigo-900/20 transition-colors">
          Confirm Booking
        </button>
      </form>
    </Modal>
  );
};

// Reusable Modal Component
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center p-5 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  </div>
);

export default ResourceBooking;
