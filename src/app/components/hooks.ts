'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    createPost,
    deletePost,
    generatePosts,
    getAccounts,
    getAppProfile,
    getErrorText,
    getPosts,
    saveAppProfile,
} from './api';
import { getNextScheduleValue } from './date';
import type { AppProfile, GeneratedPost, Notice, Post, TwitterAccount } from './types';

const emptyProfile: AppProfile = {
    appName: '',
    targetAudience: '',
    valueProposition: '',
    painPoints: '',
    tone: '親しみやすく誠実',
    landingUrl: '',
    updatedAt: null,
};

export function useAccounts(setNotice: (notice: Notice) => void) {
    const [accounts, setAccounts] = useState<TwitterAccount[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAccounts();
            setAccounts(data.accounts);
        } catch (error) {
            setNotice({ type: 'error', message: getErrorText(error) });
        } finally {
            setLoading(false);
        }
    }, [setNotice]);

    useEffect(() => {
        void loadAccounts();
    }, [loadAccounts]);

    return { accounts, loading, loadAccounts };
}

export function usePosts(setNotice: (notice: Notice) => void) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadPosts = useCallback(async () => {
        setRefreshing(true);
        try {
            setPosts(await getPosts());
        } catch (error) {
            setNotice({ type: 'error', message: getErrorText(error) });
        } finally {
            setRefreshing(false);
        }
    }, [setNotice]);

    const removePost = useCallback(async (id: string) => {
        await deletePost(id);
        setNotice({ type: 'success', message: '予約投稿を削除しました。' });
        await loadPosts();
    }, [loadPosts, setNotice]);

    useEffect(() => {
        void loadPosts();
    }, [loadPosts]);

    return { posts, refreshing, loadPosts, removePost };
}

export function useAppProfile(setNotice: (notice: Notice) => void) {
    const [profile, setProfile] = useState<AppProfile>(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            setProfile(await getAppProfile());
        } catch (error) {
            setNotice({ type: 'error', message: getErrorText(error) });
        } finally {
            setLoading(false);
        }
    }, [setNotice]);

    const saveProfile = useCallback(async (input: AppProfile) => {
        setSaving(true);
        try {
            setProfile(await saveAppProfile(input));
            setNotice({ type: 'success', message: 'アプリ情報を保存しました。' });
        } catch (error) {
            setNotice({ type: 'error', message: getErrorText(error) });
        } finally {
            setSaving(false);
        }
    }, [setNotice]);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    return { profile, loading, saving, setProfile, saveProfile };
}

export function useGeneratedPosts(setNotice: (notice: Notice) => void) {
    const [posts, setPosts] = useState<GeneratedPost[]>([]);
    const [generating, setGenerating] = useState(false);

    const generate = useCallback(async (theme: string) => {
        setGenerating(true);
        try {
            setPosts((await generatePosts(theme)).posts);
            setNotice({ type: 'success', message: '投稿案を生成しました。' });
        } catch (error) {
            setNotice({ type: 'error', message: getErrorText(error) });
        } finally {
            setGenerating(false);
        }
    }, [setNotice]);

    return { posts, generating, generate };
}

export function useSchedulePost(onCreated: () => Promise<void>, setNotice: (notice: Notice) => void) {
    const [content, setContent] = useState('');
    const [scheduledAt, setScheduledAt] = useState(getNextScheduleValue);
    const [twitterAccountId, setTwitterAccountId] = useState('');
    const [loading, setLoading] = useState(false);

    const schedule = useCallback(async () => {
        setLoading(true);
        try {
            await createPost({ content, scheduledAt, twitterAccountId });
            setContent('');
            setScheduledAt(getNextScheduleValue());
            setNotice({ type: 'success', message: '投稿を予約しました。' });
            await onCreated();
        } catch (error) {
            setNotice({ type: 'error', message: getErrorText(error) });
        } finally {
            setLoading(false);
        }
    }, [content, onCreated, scheduledAt, twitterAccountId, setNotice]);

    return { content, scheduledAt, twitterAccountId, loading, setContent, setScheduledAt, setTwitterAccountId, schedule };
}
