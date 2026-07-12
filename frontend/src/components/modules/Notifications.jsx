import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../../api/notificationApi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all');

  const filteredNotifications = view === 'all' ? notifications : notifications.filter(n => !n.read);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      // Sort by date descending
      setNotifications(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    loadData();
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Alert': return <svg className="text-red-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
      case 'Action': return <svg className="text-orange-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
      default: return <svg className="text-blue-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading activity logs...</div>;
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-black/20 min-h-[500px]">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white">Activity Logs & Notifications</h3>
          <p className="text-sm text-slate-400 mt-1">Stay informed on system activity without digging for updates.</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button 
              onClick={() => setView('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${view === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Unread
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{notifications.filter(n => !n.read).length}</span>
              )}
            </button>
          </div>
          
          {notifications.some(n => !n.read) && (
            <button onClick={async () => {
              for (const n of notifications.filter(n => !n.read)) {
                await markAsRead(n.id);
              }
              loadData();
            }} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <p className="text-slate-500 p-4 text-center">No {view === 'unread' ? 'unread ' : ''}notifications.</p>
          ) : (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`flex gap-4 p-5 rounded-xl border transition-colors ${
                  notification.read 
                    ? 'bg-slate-800/20 border-slate-800/50' 
                    : 'bg-slate-800/60 border-indigo-500/30 shadow-md shadow-indigo-900/10'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      notification.type === 'Alert' ? 'text-red-400' :
                      notification.type === 'Action' ? 'text-orange-400' : 'text-blue-400'
                    }`}>
                      {notification.type}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{notification.date}</span>
                  </div>
                  <p className={`text-sm ${notification.read ? 'text-slate-400' : 'text-white font-medium'}`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <button 
                    onClick={() => handleMarkRead(notification.id)}
                    className="flex-shrink-0 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors self-center"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
