export type Post = {
    id: string;
    content: string;
    scheduledAt: string;
    postedAt: string | null;
    failedAt: string | null;
    error: string | null;
};

export type AppProfile = {
    appName: string;
    targetAudience: string;
    valueProposition: string;
    painPoints: string;
    tone: string;
    landingUrl: string;
    updatedAt: string | null;
};

export type GeneratedPost = {
    angle: string;
    content: string;
};

export type Notice = {
    type: 'success' | 'error' | 'info';
    message: string;
} | null;

export type TwitterAccount = {
    id: string;
    twitterId: string;
    username: string;
    createdAt: string;
};
