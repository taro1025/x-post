export type SchedulePostInput = {
    content: string;
    scheduledAt: string;
};

function asRecord(value: unknown) {
    return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function readText(data: Record<string, unknown>, key: keyof SchedulePostInput) {
    const value = data[key];
    return typeof value === 'string' ? value.trim() : '';
}

export function parseScheduleDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function parseSchedulePostInput(value: unknown): SchedulePostInput {
    const data = asRecord(value);
    return {
        content: readText(data, 'content'),
        scheduledAt: readText(data, 'scheduledAt'),
    };
}

export function validateSchedulePostInput(input: SchedulePostInput, now = new Date()) {
    const scheduledAt = parseScheduleDate(input.scheduledAt);
    if (!input.content) return '投稿文を入力してください。';
    if (input.content.length > 280) return '投稿文は280文字以内で入力してください。';
    if (!scheduledAt) return '予約日時を正しく入力してください。';
    if (scheduledAt <= now) return '予約日時は現在より後にしてください。';
    return null;
}
