'use client';

import { useState, useEffect } from 'react';
import { Trash2, Calendar, Clock, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmModal from './ConfirmModal';

type Post = {
    id: string;
    content: string;
    scheduledAt: string;
    postedAt: string | null;
    failedAt: string | null;
    error: string | null;
};

export default function Dashboard() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [content, setContent] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchPosts = async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/api/posts');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content || !scheduledAt) return;

        setLoading(true);
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, scheduledAt }),
            });

            if (res.ok) {
                setContent('');
                setScheduledAt('');
                fetchPosts();
            } else {
                alert('Failed to schedule post');
            }
        } catch (error) {
            console.error(error);
            alert('Error scheduling post');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            console.log('Deleting:', deleteId);
            const res = await fetch(`/api/posts/${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                console.log('Delete successful');
                fetchPosts();
            } else {
                console.error('Delete failed', await res.text());
            }
        } catch (error) {
            console.error('Delete error', error);
        } finally {
            setDeleteId(null);
        }
    };

    const upcomingPosts = posts.filter((p) => !p.postedAt && !p.failedAt);
    const historyPosts = posts.filter((p) => p.postedAt || p.failedAt);

    // Set default time to next 15 min slot
    useEffect(() => {
        const now = new Date();
        const minutes = now.getMinutes();
        const remainder = 15 - (minutes % 15);
        const nextSlot = new Date(now.getTime() + (remainder + 15) * 60000); // at least 15 min future ideally, or just next slot
        nextSlot.setSeconds(0, 0);
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        const iso = nextSlot.toISOString().slice(0, 16);
        setScheduledAt(iso);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            <div className="max-w-4xl mx-auto p-6 md:p-12">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            XPilot
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Smart Scheduling for X</p>
                    </div>
                    <button
                        onClick={fetchPosts}
                        className={`p-2 rounded-full hover:bg-slate-800 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={20} className="text-slate-400" />
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* Scheduling Form */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Calendar className="text-indigo-400" size={20} />
                            Schedule New Post
                        </h2>

                        <form onSubmit={handleSchedule} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    When to post?
                                </label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={scheduledAt}
                                        onChange={(e) => setScheduledAt(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                    <Clock className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" size={16} />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    * Scheduling works best in 15-minute increments
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    What's happening?
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Type your post here..."
                                    maxLength={280}
                                    required
                                />
                                <div className="text-right text-xs text-slate-500 mt-1">
                                    {content.length}/280
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Scheduling...' : 'Schedule Post'}
                            </button>
                        </form>
                    </section>

                    {/* Lists */}
                    <section className="space-y-8">

                        {/* Upcoming */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
                                <Clock className="text-cyan-400" size={18} />
                                Upcoming Queue ({upcomingPosts.length})
                            </h2>
                            <div className="space-y-3">
                                {upcomingPosts.length === 0 && (
                                    <p className="text-slate-600 text-sm italic">No scheduled posts.</p>
                                )}
                                {upcomingPosts.map((post) => (
                                    <div key={post.id} className="group bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded">
                                                {format(new Date(post.scheduledAt), 'MMM d, HH:mm')}
                                            </span>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, post.id)}
                                                className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Cancel Post"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{post.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* History */}
                        {historyPosts.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
                                    <Check className="text-emerald-400" size={18} />
                                    History
                                </h2>
                                <div className="space-y-3 opacity-80">
                                    {historyPosts.map((post) => (
                                        <div key={post.id} className={`bg-slate-900 border border-slate-800 rounded-xl p-4 ${post.failedAt ? 'border-red-900/50' : ''}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-mono px-2 py-1 rounded ${post.failedAt ? 'text-red-400 bg-red-950/30' : 'text-emerald-400 bg-emerald-950/30'}`}>
                                                        {post.postedAt
                                                            ? `Sent: ${format(new Date(post.postedAt), 'MMM d, HH:mm')}`
                                                            : 'Failed'}
                                                    </span>
                                                    {post.failedAt && (
                                                        <AlertCircle size={14} className="text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-slate-400 text-sm whitespace-pre-wrap">{post.content}</p>
                                            {post.error && (
                                                <p className="text-red-400 text-xs mt-2 font-mono bg-red-950/20 p-2 rounded">
                                                    Error: {post.error}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </section>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="Cancel Post"
                message="Are you sure you want to cancel this scheduled post? This action cannot be undone."
                confirmText="Yes, Cancel Post"
                cancelText="No, Keep It"
                isDangerous={true}
            />
        </div>
    );
}
