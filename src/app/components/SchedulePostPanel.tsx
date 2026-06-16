'use client';

import { FormEvent } from 'react';
import { CalendarPlus, Clock } from 'lucide-react';

type Props = {
    content: string;
    scheduledAt: string;
    loading: boolean;
    onContentChange: (value: string) => void;
    onScheduledAtChange: (value: string) => void;
    onSubmit: () => void;
};

export default function SchedulePostPanel(props: Props) {
    const submit = (event: FormEvent) => {
        event.preventDefault();
        props.onSubmit();
    };

    return (
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-neutral-950">
                <CalendarPlus size={18} className="text-emerald-600" /> 予約投稿
            </h2>
            <form onSubmit={submit} className="grid gap-3">
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                    投稿日時
                    <span className="relative">
                        <input className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-9 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" type="datetime-local" value={props.scheduledAt} onChange={(e) => props.onScheduledAtChange(e.target.value)} required />
                        <Clock className="absolute right-3 top-2.5 text-neutral-400" size={16} />
                    </span>
                </label>
                <label className="grid gap-1 text-sm font-medium text-neutral-700">
                    投稿文
                    <textarea className="h-36 rounded-lg border border-neutral-300 px-3 py-2 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={props.content} maxLength={280} onChange={(e) => props.onContentChange(e.target.value)} required />
                </label>
                <div className="text-right text-xs text-neutral-500">{props.content.length}/280</div>
                <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={props.loading}>
                    <CalendarPlus size={16} /> {props.loading ? '予約中...' : '予約する'}
                </button>
            </form>
        </section>
    );
}
