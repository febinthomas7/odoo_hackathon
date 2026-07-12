import React, { useState, useEffect } from 'react';
import { getBookings, createBooking, cancelBooking } from '../../api/bookingApi';
import { getAssets } from '../../api/assetApi';
import { getEmployees } from '../../api/organizationApi';
import { mockBookings } from '../../api/mockData';
import { logActivity } from '../../api/activityLogApi';

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

const ResourceBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);

  const autoTransitionStatuses = (bList) => {
    const now = new Date();
    const currentDateStr = now.toISOString().split('T')[0];
    const currentMin = now.getHours() * 60 + now.getMinutes();

    return bList.map(b => {
      if (b.status === 'Cancelled' || b.status === 'Completed') return b;

      const [startH, startM] = b.startTime.split(':').map(Number);
      const [endH, endM] = b.endTime.split(':').map(Number);
      const startTotal = startH * 60 + startM;
      const endTotal = endH * 60 + endM;

      if (b.date < currentDateStr || (b.date === currentDateStr && endTotal <= currentMin)) {
        b.status = 'Completed';
      } else if (b.date === currentDateStr && startTotal <= currentMin && endTotal > currentMin) {
        b.status = 'Ongoing';
      } else {
        b.status = 'Upcoming';
      }
      return b;
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookData, assetsData, empData] = await Promise.all([
        getBookings(),
        getAssets(),
        getEmployees()
      ]);
      
      const transitionedBookings = autoTransitionStatuses(bookData);
      setBookings([...transitionedBookings]);
      setAssets(assetsData.filter(a => a.shared));
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

  const openReschedule = (booking) => {
    setEditingBooking(booking);
    setShowModal(true);
  };

  // Timeline helpers
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.date === b.date) return a.startTime.localeCompare(b.startTime);
    return a.date.localeCompare(b.date);
  });

  const timelineDays = Array.from(new Set(sortedBookings.map(b => b.date)));

  return (
    <div className="w-full">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 min-h-[500px]">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Resource Bookings</h3>
            <p className="text-sm text-slate-400 mt-1">Manage reservations for shared assets like meeting rooms and vehicles.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                title="List View"
              >
                <ListIcon />
              </button>
              <button 
                onClick={() => setViewMode('timeline')} 
                className={`p-1.5 rounded-md ${viewMode === 'timeline' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Timeline View"
              >
                <CalendarIcon />
              </button>
            </div>
            <button onClick={() => { setEditingBooking(null); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/20">
              <PlusIcon /> Book Resource
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-slate-500">No bookings found.</div>
        ) : viewMode === 'list' ? (
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
                {sortedBookings.map((booking) => (
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
                        <div className="flex justify-end gap-3">
                          <button onClick={() => openReschedule(booking)} className="text-indigo-400 hover:text-indigo-300 font-medium text-sm">Reschedule</button>
                          <button onClick={() => handleCancel(booking.id)} className="text-red-400 hover:text-red-300 font-medium text-sm">Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-8">
            {timelineDays.map(day => (
              <div key={day}>
                <h4 className="text-sm font-bold text-slate-400 border-b border-slate-800 pb-2 mb-4">{day}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedBookings.filter(b => b.date === day).map(booking => (
                    <div key={booking.id} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        booking.status === 'Completed' ? 'bg-emerald-500' :
                        booking.status === 'Upcoming' ? 'bg-blue-500' :
                        booking.status === 'Ongoing' ? 'bg-indigo-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <h5 className="font-bold text-white text-sm">{booking.assetName}</h5>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          booking.status === 'Completed' ? 'text-emerald-400' :
                          booking.status === 'Upcoming' ? 'text-blue-400' :
                          booking.status === 'Ongoing' ? 'text-indigo-400' : 'text-red-400'
                        }`}>{booking.status}</span>
                      </div>
                      <div className="pl-2 space-y-1">
                        <p className="text-xs text-slate-400 flex justify-between">
                          <span>Time:</span>
                          <span className="text-slate-300 font-medium">{booking.startTime} - {booking.endTime}</span>
                        </p>
                        <p className="text-xs text-slate-400 flex justify-between">
                          <span>By:</span>
                          <span className="text-indigo-300 font-medium">{booking.bookedBy}</span>
                        </p>
                      </div>
                      {booking.status === 'Upcoming' && (
                        <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-end gap-3 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openReschedule(booking)} className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider">Reschedule</button>
                          <button onClick={() => handleCancel(booking.id)} className="text-[11px] font-semibold text-red-400 hover:text-red-300 uppercase tracking-wider">Cancel</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <BookingModal 
          assets={assets} 
          employees={employees} 
          onClose={() => { setShowModal(false); setErrorMsg(''); setEditingBooking(null); }} 
          onComplete={loadData} 
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
          editingBooking={editingBooking}
        />
      )}
    </div>
  );
};

const BookingModal = ({ assets, employees, onClose, onComplete, errorMsg, setErrorMsg, editingBooking }) => {
  const [formData, setFormData] = useState({ 
    assetId: editingBooking ? editingBooking.assetId : '', 
    bookedBy: editingBooking ? editingBooking.bookedBy : '', 
    date: editingBooking ? editingBooking.date : '', 
    startTime: editingBooking ? editingBooking.startTime : '', 
    endTime: editingBooking ? editingBooking.endTime : '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if(formData.startTime >= formData.endTime) {
      setErrorMsg("End time must be after start time.");
      return;
    }

    try {
      if (editingBooking) {
        // Handle Reschedule locally for mock
        const isOverlap = mockBookings.some(b => 
          b.id !== editingBooking.id &&
          b.assetId.toString() === formData.assetId.toString() && 
          b.date === formData.date &&
          b.status !== 'Cancelled' &&
          ((formData.startTime >= b.startTime && formData.startTime < b.endTime) ||
           (formData.endTime > b.startTime && formData.endTime <= b.endTime) ||
           (formData.startTime <= b.startTime && formData.endTime >= b.endTime))
        );
        if(isOverlap) throw new Error("This resource is already booked for the selected time slot.");
        
        const idx = mockBookings.findIndex(b => b.id === editingBooking.id);
        if(idx !== -1) {
          mockBookings[idx] = { ...mockBookings[idx], ...formData };
          logActivity(`Rescheduled booking for ${mockBookings[idx].assetName}`);
        }
      } else {
        const selectedAsset = assets.find(a => a.id.toString() === formData.assetId.toString());
        await createBooking({
          ...formData,
          assetName: selectedAsset.name
        });
      }
      onComplete();
      onClose();
    } catch (error) {
      setErrorMsg(error.message || "Failed to process booking.");
    }
  };

  return (
    <Modal title={editingBooking ? "Reschedule Booking" : "Book a Resource"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm font-medium">
            {errorMsg}
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Select Resource</label>
          <select required value={formData.assetId} onChange={e => setFormData({...formData, assetId: e.target.value})} disabled={!!editingBooking} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50">
            <option value="">Select...</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Booked By</label>
          <select required value={formData.bookedBy} onChange={e => setFormData({...formData, bookedBy: e.target.value})} disabled={!!editingBooking} className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50">
            <option value="">Select Employee...</option>
            {employees.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
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
          {editingBooking ? "Confirm Reschedule" : "Confirm Booking"}
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
