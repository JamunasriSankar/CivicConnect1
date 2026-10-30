import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ClipboardList, Users, Search, CheckSquare,
    RefreshCw, Bell, User, HelpCircle, LogOut,
    ChevronLeft, ChevronRight, Building2, Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/assignments', label: 'My Assignments', icon: ClipboardList },
    { path: '/community-reports', label: 'Community Reports', icon: Users },
    { path: '/field-inspections', label: 'Field Inspections', icon: Search },
    { path: '/update-status', label: 'Update Status', icon: RefreshCw },
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: true },
    { path: '/profile', label: 'My Profile', icon: User },
    { path: '/help', label: 'Help & Support', icon: HelpCircle },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { unreadCount, worker } = useApp();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => setShowLogoutModal(true);
    const confirmLogout = () => {
        setShowLogoutModal(false);
        // Clear any session data if needed
        navigate('/');
    };

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`flex flex-col h-screen transition-all duration-300 ease-in-out flex-shrink-0`}
                style={{
                    width: collapsed ? '64px' : '256px',
                    background: 'linear-gradient(180deg, #142B4A 0%, #1D3B64 100%)',
                    position: 'sticky',
                    top: 0,
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                    <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Building2 size={18} style={{ color: '#142B4A' }} />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">CivicConnect</p>
                            <p className="text-blue-300 text-xs whitespace-nowrap">ASHA Worker Portal</p>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="ml-auto flex-shrink-0 text-blue-300 hover:text-white transition-colors p-1 rounded"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {/* Worker badge */}
                {!collapsed && (
                    <div className="mx-3 mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white shadow"
                                style={{ background: '#D6AD60' }}>
                                {worker.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-white text-xs font-semibold truncate">{worker.name}</p>
                                <p className="text-blue-300 text-xs truncate">{worker.id}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                    {navItems.map(({ path, label, icon: Icon, badge }) => (
                        <NavLink
                            key={path}
                            to={path}
                            end={path === '/'}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}
                 ${collapsed ? 'justify-center px-2' : ''}`
                            }
                            title={collapsed ? label : ''}
                        >
                            <div className="relative flex-shrink-0">
                                <Icon size={18} />
                                {badge && unreadCount > 0 && collapsed && (
                                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            {!collapsed && (
                                <span className="flex-1 text-sm truncate">{label}</span>
                            )}
                            {!collapsed && badge && unreadCount > 0 && (
                                <span className="flex-shrink-0 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-2 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className={`sidebar-link sidebar-link-inactive w-full ${collapsed ? 'justify-center px-2' : ''}`}
                        title={collapsed ? 'Logout' : ''}
                    >
                        <LogOut size={18} className="flex-shrink-0" />
                        {!collapsed && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <LogOut size={22} className="text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center">Confirm Logout</h3>
                        <p className="text-sm text-gray-500 mt-2 text-center">
                            Are you sure you want to logout from the CivicConnect ASHA Worker Portal?
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowLogoutModal(false)} className="btn-secondary flex-1 justify-center">
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors justify-center flex items-center gap-2"
                            >
                                <LogOut size={15} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
