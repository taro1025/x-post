'use client';

import { FormEvent, useState } from 'react';
import { PenLine, Sparkles } from 'lucide-react';
import type { GeneratedPost } from './types';

type Props = {
    posts: GeneratedPost[];
    generating: boolean;
    onGenerate: (theme: string) => void;
    onUsePost: (content: string) => void;
};

function GeneratedPostItem({ post, onUsePost }: {
    post: GeneratedPost;
    onUsePost: (content: string) => void;
}) {
    return (
        <article className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="mb-2 text-xs font-semibold text-sky-700">{post.angle}</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-800">{post.content}</p>
            <button className="mt-3 inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium" onClick={() => onUsePost(post.content)}>
                <PenLine size={15} /> 本文に入れる
            </button>
        </article>
    );
}

export default function GeneratePostsPanel({ posts, generating, onGenerate, onUsePost }: Props) {
    const [theme, setTheme] = useState('');
    const submit = (event: FormEvent) => {
        event.preventDefault();
        onGenerate(theme);
    };

    return (
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-neutral-950">
                <Sparkles size={18} className="text-amber-600" /> AI下書き
            </h2>
            <form onSubmit={submit} className="mb-4 grid gap-3">
                <input className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" value={theme} placeholder="投稿テーマ（任意）" onChange={(e) => setTheme(e.target.value)} />
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-neutral-950 disabled:opacity-50" disabled={generating}>
                    <Sparkles size={16} /> {generating ? '生成中...' : '投稿案を生成'}
                </button>
            </form>
            <div className="grid gap-3">
                {posts.map((post) => <GeneratedPostItem key={`${post.angle}-${post.content}`} post={post} onUsePost={onUsePost} />)}
            </div>
        </section>
    );
}
