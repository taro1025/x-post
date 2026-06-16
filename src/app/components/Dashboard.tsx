'use client';

import { useState } from 'react';
import AppProfilePanel from './AppProfilePanel';
import ConfirmModal from './ConfirmModal';
import GeneratePostsPanel from './GeneratePostsPanel';
import NoticeBanner from './NoticeBanner';
import PostQueue from './PostQueue';
import SchedulePostPanel from './SchedulePostPanel';
import { getErrorText } from './api';
import { useAppProfile, useGeneratedPosts, usePosts, useSchedulePost } from './hooks';
import type { Notice } from './types';

export default function Dashboard() {
    const [notice, setNotice] = useState<Notice>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const queue = usePosts(setNotice);
    const profile = useAppProfile(setNotice);
    const generated = useGeneratedPosts(setNotice);
    const schedule = useSchedulePost(queue.loadPosts, setNotice);

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await queue.removePost(deleteId);
        } catch (error) {
            setNotice({ type: 'error', message: getErrorText(error) });
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-50 px-4 py-5 text-neutral-950 md:px-8 md:py-8">
            <div className="mx-auto grid max-w-6xl gap-5">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-normal">XPilot</h1>
                        <p className="text-sm text-neutral-500">iOSアプリのXマーケ運用</p>
                    </div>
                </header>
                <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />
                <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
                    <div className="grid gap-5">
                        <AppProfilePanel {...profile} onChange={profile.setProfile} onSave={profile.saveProfile} />
                        <GeneratePostsPanel {...generated} onGenerate={generated.generate} onUsePost={schedule.setContent} />
                    </div>
                    <div className="grid content-start gap-5">
                        <SchedulePostPanel
                            content={schedule.content}
                            scheduledAt={schedule.scheduledAt}
                            loading={schedule.loading}
                            onContentChange={schedule.setContent}
                            onScheduledAtChange={schedule.setScheduledAt}
                            onSubmit={schedule.schedule}
                        />
                        <PostQueue {...queue} onRefresh={queue.loadPosts} onDeleteClick={setDeleteId} />
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
                title="予約投稿を削除"
                message="この予約投稿を削除します。元に戻せません。"
                confirmText="削除する"
                cancelText="残す"
                isDangerous
            />
        </main>
    );
}
