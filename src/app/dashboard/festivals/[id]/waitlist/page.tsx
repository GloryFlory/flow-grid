'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Download, Search, Clock, Mail, Trash2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  position: number;
  status: string;
  createdAt: string;
  notifiedAt: string | null;
  session: {
    id: string;
    title: string;
    day: string;
    startTime: string;
    endTime: string;
  };
}

export default function FestivalWaitlistPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [festivalName, setFestivalName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchWaitlist();
      fetchBookingsCount();
    }
  }, [status, router, params.id]);

  const fetchWaitlist = async () => {
    try {
      const response = await fetch(`/api/admin/festivals/${params.id}/waitlist`);
      if (!response.ok) throw new Error('Failed to fetch waitlist');
      
      const data = await response.json();
      setWaitlistEntries(data.waitlist);
      setFestivalName(data.festivalName);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
      toast.error('Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsCount = async () => {
    try {
      const response = await fetch(`/api/admin/festivals/${params.id}/bookings`);
      if (response.ok) {
        const data = await response.json();
        setBookingsCount(data.bookings?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching bookings count:', error);
    }
  };

  const handleRemoveFromWaitlist = async (entryId: string) => {
    if (!confirm('Are you sure you want to remove this person from the waitlist?')) return;
    
    try {
      const response = await fetch(`/api/admin/festivals/${params.id}/waitlist/${entryId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove from waitlist');
      
      setWaitlistEntries(prev => prev.filter(e => e.id !== entryId));
      toast.success('Removed from waitlist');
    } catch (error) {
      console.error('Error removing from waitlist:', error);
      toast.error('Failed to remove from waitlist');
    }
  };

  const handleNotifyNext = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/festivals/${params.id}/sessions/${sessionId}/notify-waitlist`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to notify');
      
      const data = await response.json();
      toast.success(data.message || 'Notification sent!');
      fetchWaitlist(); // Refresh the list
    } catch (error) {
      console.error('Error notifying:', error);
      toast.error('Failed to send notification');
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Session', 'Day', 'Time', 'Name', 'Email', 'Position', 'Status', 'Joined At', 'Notified At'].join(','),
      ...filteredEntries.map(e => {
        const displayDay = e.session.day === 'Invalid Date' 
          ? (e.session.startTime ? new Date(e.session.startTime).toLocaleDateString('en-US', { weekday: 'long' }) : 'TBD')
          : e.session.day;
        
        return [
          `"${e.session.title}"`,
          displayDay,
          `${formatTime(e.session.startTime)}-${formatTime(e.session.endTime)}`,
          `"${e.name}"`,
          e.email,
          e.position,
          e.status,
          new Date(e.createdAt).toLocaleString(),
          e.notifiedAt ? new Date(e.notifiedAt).toLocaleString() : 'N/A'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${festivalName}-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    if (time.includes('T')) {
      return time.split('T')[1]?.substring(0, 5) || time;
    }
    return time.substring(0, 5);
  };

  const uniqueSessions = Array.from(new Set(waitlistEntries.map(e => e.session.id)))
    .map(id => waitlistEntries.find(e => e.session.id === id)!.session);

  const filteredEntries = waitlistEntries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.session.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSession = filterSession === 'all' || entry.session.id === filterSession;
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    
    return matchesSearch && matchesSession && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OFFERED':
        return 'bg-blue-100 text-blue-800';
      case 'CLAIMED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-600';
      case 'CANCELLED':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/dashboard/festivals/${params.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Festival
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings & Waitlist</h1>
              <p className="text-gray-600">{festivalName}</p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={filteredEntries.length === 0}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <Link 
            href={`/dashboard/festivals/${params.id}/bookings`}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent -mb-px"
          >
            Bookings ({bookingsCount})
          </Link>
          <Link 
            href={`/dashboard/festivals/${params.id}/waitlist`}
            className="px-4 py-2 text-sm font-medium text-purple-600 border-b-2 border-purple-600 -mb-px"
          >
            Waitlist ({waitlistEntries.length})
          </Link>
        </div>

        {/* Automation Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Automated Waitlist</h3>
              <p className="text-sm text-blue-700 mt-1">
                When someone cancels, the next person in the waitlist is automatically notified via email. 
                Offers expire based on how soon the session starts. You can also manually trigger a notification using the bell icon.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {waitlistEntries.filter(e => e.status === 'WAITING' || e.status === 'OFFERED').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {waitlistEntries.filter(e => e.status === 'WAITING').length}
            </div>
            <div className="text-sm text-gray-600">Waiting</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {waitlistEntries.filter(e => e.status === 'OFFERED').length}
            </div>
            <div className="text-sm text-gray-600">Offered</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {waitlistEntries.filter(e => e.status === 'CLAIMED').length}
            </div>
            <div className="text-sm text-gray-600">Claimed</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-400">
              {waitlistEntries.filter(e => e.status === 'EXPIRED').length}
            </div>
            <div className="text-sm text-gray-600">Expired</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or session..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Sessions</option>
              {uniqueSessions.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="WAITING">Waiting</option>
              <option value="OFFERED">Offered</option>
              <option value="CLAIMED">Claimed</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No waitlist entries</h3>
            <p className="text-gray-600">
              {waitlistEntries.length === 0 
                ? "No one has joined the waitlist yet."
                : "No entries match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEntries.map((entry) => {
                    const displayDay = entry.session.day === 'Invalid Date' 
                      ? (entry.session.startTime 
                          ? new Date(entry.session.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) 
                          : 'TBD')
                      : entry.session.day;
                    
                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{entry.session.title}</div>
                          <div className="text-sm text-gray-500">
                            {displayDay} • {formatTime(entry.session.startTime)}-{formatTime(entry.session.endTime)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-900">{entry.name}</td>
                        <td className="px-4 py-4">
                          <a href={`mailto:${entry.email}`} className="text-purple-600 hover:text-purple-800 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {entry.email}
                          </a>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                            {entry.position}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {entry.status === 'WAITING' && entry.position === 1 && (
                              <button
                                onClick={() => handleNotifyNext(entry.session.id)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Notify this person (send offer email)"
                              >
                                <Bell className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveFromWaitlist(entry.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Remove from waitlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
