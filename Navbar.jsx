import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, Search, User, ChevronDown, Calendar, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';

const pageTitles = {
    '/': 'Dashboard',
    '/assignments': 'My Assignments',
    '/community-reports': 'Community Reports',
    '/field-inspections': 'Field Inspections',
    '/update-status': 'Update Status',
    '/notifications': 'Notifications',
    '/profile': 'My Profile',
    '/help': 'Help & Support',
};

const Navbar = ({ onMobileMenuToggle }) => {
    const { worker, notifications, unreadCount, markNotificationRead } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const today = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const pageTitle = pageTitles[location.pathname] || 'Dashboard';

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifDropdown(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const recentNotifs = notifications.slice(0, 5);

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3">
                {/* Mobile menu button */}
                <button
                    onClick={onMobileMenuToggle}
                    className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                    <Menu size={20} />
                </button>

                {/* Page Title */}
                <div className="hidden sm:block">
                    <h1 className="text-base font-bold" style={{ color: '#142B4A' }}>{pageTitle}</h1>
                </div>

                {/* Search */}
                <div className="flex-1 max-w-md relative ml-4 hidden md:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search complaints, inspections…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && searchQuery.trim()) {
                                navigate(`/assignments?search=${encodeURIComponent(searchQuery.trim())}`);
                                setSearchQuery('');
                            }
                        }}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50"
                        style={{ '--tw-ring-color': 'rgba(20,43,74,0.2)' }}
                    />
                </div>

                <div className="ml-auto flex items-center gap-3">
                    {/* Date */}
                    <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} />
                        <span>{today}</span>
                    </div>

                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowProfileDropdown(false); }}
                            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <h3 className="font-semibold text-sm text-gray-900">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                    {recentNotifs.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-6">No notifications</p>
                                    ) : (
                                        recentNotifs.map(n => (
                                            <div
                                                key={n.id}
                                                onClick={() => { markNotificationRead(n.id); navigate('/notifications'); setShowNotifDropdown(false); }}
                                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                                                    <div className={!n.read ? '' : 'pl-4'}>
                                                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="px-4 py-2.5 border-t border-gray-100">
                                    <Link
                                        to="/notifications"
                                        onClick={() => setShowNotifDropdown(false)}
                                        className="text-xs font-semibold hover:underline"
                                        style={{ color: '#142B4A' }}
                                    >
                                        View all notifications →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); }}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
                                style={{ background: '#142B4A' }}
                            >
                                {worker.name.charAt(0)}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-xs font-semibold text-gray-800 leading-tight">{worker.name}</p>
                                <p className="text-xs text-gray-400 leading-tight">{worker.designation}</p>
                            </div>
                            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                        </button>

                        {showProfileDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800">{worker.name}</p>
                                    <p className="text-xs text-gray-500">{worker.id}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowProfileDropdown(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <User size={14} /> My Profile
                                    </Link>
                                    <Link
                                        to="/notifications"
                                        onClick={() => setShowProfileDropdown(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <Bell size={14} /> Notifications
                                        {unreadCount > 0 && (
                                            <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
