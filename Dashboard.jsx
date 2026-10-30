import React from 'react';
import { Link } from 'react-router-dom';
import {
    ClipboardList, CalendarCheck, Clock, CheckCircle,
    MapPin, Upload, RefreshCw, ArrowRight, ChevronRight, Bell,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import StatusBadge, { PriorityBadge } from '../components/StatusBadge';
import { weeklyPerformance, recentActivities } from '../data/mockData';

const activityIcons = {
    assignment: <ClipboardList size={15} className="text-blue-600" />,
    evidence: <Upload size={15} className="text-purple-600" />,
    status: <RefreshCw size={15} className="text-orange-500" />,
    visit: <MapPin size={15} className="text-green-600" />,
    resolved: <CheckCircle size={15} className="text-green-600" />,
};

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const Dashboard = () => {
    const { complaints, fieldVisits, notifications, worker } = useApp();

    const total = complaints.length;
    const pending = complaints.filter(c => ['Assigned', 'Accepted'].includes(c.status)).length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    const recentComplaints = [...complaints]
        .sort((a, b) => new Date(b.assignedDate) - new Date(a.assignedDate))
        .slice(0, 5);

    const upcomingVisits = fieldVisits
        .filter(v => v.status !== 'Completed')
        .slice(0, 4);

    const recentNotifications = notifications
        .filter(n => !n.read)
        .slice(0, 3);

    // Today's pending tasks
    const pendingTasks = complaints.filter(c => c.status === 'Assigned' || c.status === 'Accepted').slice(0, 4);

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div
                className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #142B4A 0%, #1D3B64 60%, #2d4d80 100%)' }}
            >
                <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
                    <div>
                        <p className="text-blue-300 text-sm font-medium">{getGreeting()},</p>
                        <h1 className="text-2xl font-bold mt-1">Welcome Back, {worker.name.split(' ')[0]}! 👋</h1>
                        <p className="text-blue-300 text-sm mt-2">{worker.ward} · {worker.designation}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-sm">
                        <p className="text-blue-200 text-xs">Worker ID</p>
                        <p className="font-bold tracking-wide text-lg">{worker.id}</p>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -right-5 -bottom-10 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    title="Total Assigned"
                    value={total}
                    icon={ClipboardList}
                    color="navy"
                    trendLabel="+2 this week"
                    trend={1}
                    subtitle="All active complaints"
                />
                <StatCard
                    title="Pending Inspections"
                    value={pending}
                    icon={CalendarCheck}
                    color="orange"
                    trendLabel="Requires action"
                    trend={0}
                    subtitle="Awaiting your visit"
                />
                <StatCard
                    title="In Progress"
                    value={inProgress}
                    icon={Clock}
                    color="blue"
                    trendLabel="Active cases"
                    trend={1}
                    subtitle="Being worked on"
                />
                <StatCard
                    title="Resolved"
                    value={resolved}
                    icon={CheckCircle}
                    color="green"
                    trendLabel="+3 this month"
                    trend={1}
                    subtitle="Successfully closed"
                />
            </div>

            {/* Chart + Activity Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Weekly Performance Chart */}
                <div className="card xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900">Weekly Inspection Activity</h2>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Last 7 days</span>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weeklyPerformance} barSize={12} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: 10, border: 'none',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12,
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="complaints" name="Complaints" fill="#142B4A" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="visits" name="Field Visits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="resolved" name="Resolved" fill="#16A36A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Today's Field Activities</h2>
                    <div className="space-y-3">
                        {recentActivities.map(act => (
                            <div key={act.id} className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {activityIcons[act.type] || <ClipboardList size={14} />}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-700 leading-relaxed">{act.message}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3-column row: Pending Tasks | Notifications | Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Pending Tasks */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">Pending Tasks</h2>
                        <Link to="/assignments" className="text-xs font-semibold hover:underline" style={{ color: '#142B4A' }}>
                            View all →
                        </Link>
                    </div>
                    {pendingTasks.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No pending tasks. All caught up! 🎉</p>
                    ) : (
                        <div className="space-y-3">
                            {pendingTasks.map(c => (
                                <div key={c.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                                    <CalendarCheck size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{c.title}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">{c.id} · {c.priority} priority</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Notifications */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">Recent Notifications</h2>
                        <Link to="/notifications" className="text-xs font-semibold hover:underline" style={{ color: '#142B4A' }}>
                            View all →
                        </Link>
                    </div>
                    {recentNotifications.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No new notifications.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentNotifications.map(n => (
                                <div key={n.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                                    <Bell size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="card">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        {[
                            { to: '/assignments', label: 'View My Assignments', icon: ClipboardList },
                            { to: '/field-inspections', label: 'Start Field Inspection', icon: MapPin },
                            { to: '/update-status', label: 'Update Complaint Status', icon: RefreshCw },
                            { to: '/community-reports', label: 'Community Reports', icon: Clock },
                        ].map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all group"
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-navy-800/10 transition-colors">
                                    <Icon size={15} style={{ color: '#142B4A' }} />
                                </div>
                                <span className="text-xs font-medium text-gray-700">{label}</span>
                                <ChevronRight size={13} className="text-gray-400 ml-auto" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Assigned Complaints Table */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Recent Assigned Complaints</h2>
                    <Link to="/assignments" className="text-xs font-semibold hover:underline flex items-center gap-1" style={{ color: '#142B4A' }}>
                        View all <ArrowRight size={13} />
                    </Link>
                </div>
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {['Complaint ID', 'Title', 'Department', 'Priority', 'Status', 'Action'].map(h => (
                                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentComplaints.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-3 font-mono text-xs font-semibold whitespace-nowrap" style={{ color: '#142B4A' }}>{c.id}</td>
                                    <td className="py-3 px-3 max-w-[180px]">
                                        <p className="font-medium text-gray-800 truncate">{c.title}</p>
                                        <p className="text-xs text-gray-400 truncate">{c.address.split(',')[0]}</p>
                                    </td>
                                    <td className="py-3 px-3 whitespace-nowrap">
                                        <span className="badge bg-gray-100 text-gray-700">{c.category}</span>
                                    </td>
                                    <td className="py-3 px-3 whitespace-nowrap"><PriorityBadge priority={c.priority} /></td>
                                    <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                                    <td className="py-3 px-3">
                                        <Link to={`/assignments?id=${c.id}`} className="btn-primary py-1.5 px-3 text-xs">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upcoming Field Visits */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">Upcoming Field Visits</h2>
                    <Link to="/field-inspections" className="text-xs font-semibold hover:underline flex items-center gap-1" style={{ color: '#142B4A' }}>
                        View all <ArrowRight size={13} />
                    </Link>
                </div>
                {upcomingVisits.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <CalendarCheck size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No upcoming visits scheduled.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        {upcomingVisits.map(v => (
                            <div key={v.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className="text-xs font-mono font-semibold" style={{ color: '#142B4A' }}>{v.complaintId}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.status === 'Scheduled' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{v.status}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 truncate">{v.complaintTitle}</p>
                                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                                    <CalendarCheck size={12} />
                                    <span>{v.visitDate} · {v.visitTime}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                    <MapPin size={12} />
                                    <span className="truncate">{v.citizenArea}</span>
                                </div>
                                <Link
                                    to="/field-inspections"
                                    state={{ complaintId: v.complaintId }}
                                    className="mt-3 flex items-center gap-1 text-xs font-medium hover:underline"
                                    style={{ color: '#142B4A' }}
                                >
                                    Start Inspection <ChevronRight size={12} />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
