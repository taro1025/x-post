'use client';

import { CheckCircle2, Info, XCircle } from 'lucide-react';
import type { Notice } from './types';

type NoticeBannerProps = {
    notice: Notice;
    onDismiss: () => void;
};

const toneClass = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-sky-200 bg-sky-50 text-sky-900',
};

function NoticeIcon({ type }: { type: NonNullable<Notice>['type'] }) {
    if (type === 'success') return <CheckCircle2 size={18} />;
    if (type === 'error') return <XCircle size={18} />;
    return <Info size={18} />;
}

export default function NoticeBanner({ notice, onDismiss }: NoticeBannerProps) {
    if (!notice) return null;

    return (
        <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${toneClass[notice.type]}`}>
            <div className="flex items-center gap-2">
                <NoticeIcon type={notice.type} />
                <span>{notice.message}</span>
            </div>
            <button className="font-medium" onClick={onDismiss}>閉じる</button>
        </div>
    );
}
