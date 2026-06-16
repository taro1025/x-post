'use client';

import { AlertCircle, Check, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { formatPostTime } from './date';
import type { Post } from './types';

type Props = {
    posts: Post[];
    refreshing: boolean;
    onRefresh: () => void;
    onDeleteClick: (id: string) => void;
};

function EmptyState() {
    return <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">予約投稿はありません。</p>;
}

function UpcomingPost({ post, onDeleteClick }: { post: Post; onDeleteClick: (id: string) => void }) {
    return (
        <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="rounded bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700">{formatPostTime(post.scheduledAt)}</span>
                <button className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600" title="予約を削除" onClick={() => onDeleteClick(post.id)}>
                    <Trash2 size={16} />
                </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-800">{post.content}</p>
        </article>
    );
}

function HistoryPost({ post }: { post: Post }) {
    const failed = Boolean(post.failedAt);
    return (
        <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
                {failed ? <AlertCircle size={16} className="text-red-600" /> : <Check size={16} className="text-emerald-600" />}
                <span className={failed ? 'text-xs font-semibold text-red-700' : 'text-xs font-semibold text-emerald-700'}>
                    {post.postedAt ? `投稿済み ${formatPostTime(post.postedAt)}` : '失敗'}
                </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">{post.content}</p>
            {post.error && <p className="mt-2 rounded bg-red-50 p-2 text-xs text-red-700">{post.error}</p>}
        </article>
    );
}

export default function PostQueue({ posts, refreshing, onRefresh, onDeleteClick }: Props) {
    const upcoming = posts.filter((post) => !post.postedAt && !post.failedAt);
    const history = posts.filter((post) => post.postedAt || post.failedAt);

    return (
        <section className="grid gap-5">
            <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-950">
                    <Clock size={18} className="text-sky-600" /> 投稿キュー
                </h2>
                <button className={`rounded-lg border border-neutral-300 bg-white p-2 ${refreshing ? 'animate-spin' : ''}`} title="更新" onClick={onRefresh}>
                    <RefreshCw size={16} />
                </button>
            </div>
            <div className="grid gap-3">{upcoming.length ? upcoming.map((post) => <UpcomingPost key={post.id} post={post} onDeleteClick={onDeleteClick} />) : <EmptyState />}</div>
            {history.length > 0 && (
                <div className="grid gap-3">
                    <h3 className="text-sm font-semibold text-neutral-700">履歴</h3>
                    {history.map((post) => <HistoryPost key={post.id} post={post} />)}
                </div>
            )}
        </section>
    );
}
