import OpenAI from 'openai';
import type { AppProfileInput } from './app-profile';

export type GeneratedPost = {
    angle: string;
    content: string;
};

type GeneratedPostPayload = {
    posts?: GeneratedPost[];
};

const DEFAULT_MODEL = 'gpt-5.5';

const postSchema = {
    type: 'object',
    properties: {
        posts: {
            type: 'array',
            minItems: 3,
            maxItems: 3,
            items: {
                type: 'object',
                properties: {
                    angle: { type: 'string' },
                    content: { type: 'string', maxLength: 280 },
                },
                required: ['angle', 'content'],
                additionalProperties: false,
            },
        },
    },
    required: ['posts'],
    additionalProperties: false,
};

export function isOpenAIConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
}

function createOpenAIClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY が設定されていません。');
    }
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getModel() {
    return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
}

function buildInstructions() {
    return [
        'あなたはtoC向けiOSアプリのXマーケティング担当です。',
        '売り込みすぎず、個人開発者らしい誠実さと具体性を重視してください。',
        '各投稿は日本語、280文字以内、誇大表現なし、ハッシュタグは最大2個です。',
    ].join('\n');
}

function buildInput(profile: AppProfileInput, theme: string) {
    return JSON.stringify({
        app: profile,
        theme: theme || '認知獲得につながる投稿案',
        request: '違う切り口のX投稿案を3件作成してください。',
    });
}

function parseGeneratedPosts(text: string) {
    const payload = JSON.parse(text) as GeneratedPostPayload;
    return Array.isArray(payload.posts) ? payload.posts : [];
}

function normalizePost(post: GeneratedPost) {
    return {
        angle: post.angle.trim(),
        content: post.content.trim(),
    };
}

function getValidPosts(posts: GeneratedPost[]) {
    return posts
        .map(normalizePost)
        .filter((post) => post.content && post.content.length <= 280)
        .slice(0, 3);
}

export async function generateMarketingPosts(profile: AppProfileInput, theme: string) {
    const response = await createOpenAIClient().responses.create({
        model: getModel(),
        instructions: buildInstructions(),
        input: buildInput(profile, theme),
        max_output_tokens: 1200,
        store: false,
        text: {
            format: {
                type: 'json_schema',
                name: 'x_marketing_posts',
                strict: true,
                schema: postSchema,
            },
        },
    });
    const posts = getValidPosts(parseGeneratedPosts(response.output_text));
    if (posts.length < 3) throw new Error('投稿案を3件生成できませんでした。');
    return posts;
}
