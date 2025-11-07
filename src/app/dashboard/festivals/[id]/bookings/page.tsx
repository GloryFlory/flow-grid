'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Booking {
  id: string;
  names: string[];
  email: string | null;
  createdAt: string;
  session: {
    id: string;
    title: string;
    day: string;
    startTime: string;
    endTime: string;
  };
}

export default function FestivalBookingsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [festivalName, setFestivalName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router, params.id]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/admin/festivals/${params.id}/bookings`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data.bookings);
      setFestivalName(data.festivalName);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Session', 'Day', 'Time', 'Names', 'Email', 'Booked At'].join(','),
      ...filteredBookings.map(b => [
        `"${b.session.title}"`,
        b.session.day,
        `${b.session.startTime}-${b.session.endTime}`,
        `"${b.names.join(', ')}"`,
        b.email || 'N/A',
        new Date(b.createdAt).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${festivalName}-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uniqueSessions = Array.from(new Set(bookings.map(b => b.session.id)))
    .map(id => bookings.find(b => b.session.id === id)!.session);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.session.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSession = filterSession === 'all' || booking.session.id === filterSession;
    
    return matchesSearch && matchesSession;
  });

  const totalSpots = filteredBookings.reduce((sum, b) => sum + b.names.length, 0);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Bookings</h1>
          <p className="dashboard-subtitle">
            {festivalName} • {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} • {totalSpots} total spot{totalSpots !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={handleExportCSV} className="btn-primary">
          Export CSV
        </button>
      </div>

      <div className="bookings-filters">
        <input
          type="text"
          placeholder="Search by name, email, or session..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={filterSession}
          onChange={(e) => setFilterSession(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Sessions ({bookings.length})</option>
          {uniqueSessions.map(session => {
            const count = bookings.filter(b => b.session.id === session.id).length;
            return (
              <option key={session.id} value={session.id}>
                {session.title} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Day & Time</th>
                <th>Attendees</th>
                <th>Email</th>
                <th>Booked At</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="session-cell">
                    <strong>{booking.session.title}</strong>
                  </td>
                  <td className="time-cell">
                    <div>{booking.session.day}</div>
                    <div className="time-range">
                      {booking.session.startTime} - {booking.session.endTime}
                    </div>
                  </td>
                  <td className="names-cell">
                    <div className="names-list">
                      {booking.names.map((name, idx) => (
                        <span key={idx} className="name-badge">
                          {name}
                        </span>
                      ))}
                    </div>
                    <span className="spots-count">
                      {booking.names.length} spot{booking.names.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="email-cell">
                    {booking.email || <span className="text-muted">No email</span>}
                  </td>
                  <td className="date-cell">
                    {new Date(booking.createdAt).toLocaleDateString()}
                    <div className="time-subtle">
                      {new Date(booking.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .bookings-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-input, .filter-select {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.95rem;
        }

        .search-input {
          flex: 1;
        }

        .filter-select {
          min-width: 250px;
        }

        .bookings-table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .bookings-table {
          width: 100%;
          border-collapse: collapse;
        }

        .bookings-table th {
          background: #f9fafb;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #e5e7eb;
        }

        .bookings-table td {
          padding: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .bookings-table tr:hover {
          background: #f9fafb;
        }

        .session-cell strong {
          color: #1f2937;
          font-size: 0.95rem;
        }

        .time-cell {
          font-size: 0.9rem;
        }

        .time-range {
          color: #6b7280;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .names-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .name-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .spots-count {
          color: #6b7280;
          font-size: 0.85rem;
        }

        .email-cell {
          font-size: 0.9rem;
          color: #4b5563;
        }

        .text-muted {
          color: #9ca3af;
          font-style: italic;
        }

        .date-cell {
          font-size: 0.9rem;
        }

        .time-subtle {
          color: #9ca3af;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
