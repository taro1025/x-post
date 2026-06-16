export const APP_PROFILE_ID = 'default';

export type AppProfileInput = {
    appName: string;
    targetAudience: string;
    valueProposition: string;
    painPoints: string;
    tone: string;
    landingUrl: string;
};

export type AppProfileResponse = AppProfileInput & {
    updatedAt: string | null;
};

const FIELD_LIMITS = {
    appName: 80,
    targetAudience: 160,
    valueProposition: 220,
    painPoints: 300,
    tone: 80,
    landingUrl: 240,
} satisfies Record<keyof AppProfileInput, number>;

const FIELD_LABELS = {
    appName: 'アプリ名',
    targetAudience: 'ターゲット',
    valueProposition: '価値訴求',
    painPoints: '悩み',
    tone: 'トーン',
    landingUrl: 'URL',
} satisfies Record<keyof AppProfileInput, string>;

export const emptyAppProfile: AppProfileResponse = {
    appName: '',
    targetAudience: '',
    valueProposition: '',
    painPoints: '',
    tone: '親しみやすく誠実',
    landingUrl: '',
    updatedAt: null,
};

function asRecord(value: unknown) {
    return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function readText(data: Record<string, unknown>, key: keyof AppProfileInput) {
    const value = data[key];
    return typeof value === 'string' ? value.trim() : '';
}

function hasValidUrl(value: string) {
    if (!value) return true;
    try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}

function findTooLongField(input: AppProfileInput) {
    const fields = Object.keys(FIELD_LIMITS) as Array<keyof AppProfileInput>;
    return fields.find((key) => input[key].length > FIELD_LIMITS[key]);
}

export function parseAppProfileInput(value: unknown): AppProfileInput {
    const data = asRecord(value);
    return {
        appName: readText(data, 'appName'),
        targetAudience: readText(data, 'targetAudience'),
        valueProposition: readText(data, 'valueProposition'),
        painPoints: readText(data, 'painPoints'),
        tone: readText(data, 'tone') || emptyAppProfile.tone,
        landingUrl: readText(data, 'landingUrl'),
    };
}

export function validateAppProfile(input: AppProfileInput) {
    if (!input.appName) return 'アプリ名を入力してください。';
    if (!input.targetAudience) return 'ターゲットを入力してください。';
    if (!input.valueProposition) return '価値訴求を入力してください。';
    if (!hasValidUrl(input.landingUrl)) return 'URLは http または https で入力してください。';

    const tooLong = findTooLongField(input);
    if (!tooLong) return null;

    return `${FIELD_LABELS[tooLong]}は${FIELD_LIMITS[tooLong]}文字以内で入力してください。`;
}

export function toAppProfileResponse(
    profile: AppProfileInput & { updatedAt?: Date | string | null },
): AppProfileResponse {
    const updatedAt = profile.updatedAt;
    return {
        ...parseAppProfileInput(profile),
        updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt ?? null,
    };
}
