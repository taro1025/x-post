import type { AppProfile, GeneratedPost, Post } from './types';

type ApiErrorBody = {
    error?: string;
    details?: string;
};

export function getErrorText(error: unknown) {
    return error instanceof Error ? error.message : '処理に失敗しました。';
}

async function readJson<T>(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(readErrorMessage(data));
    return data as T;
}

function readErrorMessage(data: unknown) {
    const body = data as ApiErrorBody;
    return body.error || body.details || '処理に失敗しました。';
}

async function requestJson<T>(url: string, options?: RequestInit) {
    const response = await fetch(url, options);
    return readJson<T>(response);
}

function jsonOptions(method: string, body: unknown): RequestInit {
    return {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}

export function getPosts() {
    return requestJson<Post[]>('/api/posts');
}

export function createPost(body: { content: string; scheduledAt: string }) {
    return requestJson<Post>('/api/posts', jsonOptions('POST', toPostPayload(body)));
}

function toPostPayload(body: { content: string; scheduledAt: string }) {
    return {
        ...body,
        scheduledAt: new Date(body.scheduledAt).toISOString(),
    };
}

export function deletePost(id: string) {
    return requestJson<{ success: boolean }>(`/api/posts/${id}`, { method: 'DELETE' });
}

export function getAppProfile() {
    return requestJson<AppProfile>('/api/app-profile');
}

export function saveAppProfile(profile: AppProfile) {
    return requestJson<AppProfile>('/api/app-profile', jsonOptions('PUT', profile));
}

export function generatePosts(theme: string) {
    return requestJson<{ posts: GeneratedPost[] }>(
        '/api/generate-posts',
        jsonOptions('POST', { theme }),
    );
}
