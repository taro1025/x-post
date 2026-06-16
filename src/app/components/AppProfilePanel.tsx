'use client';

import { FormEvent } from 'react';
import { Save, Smartphone } from 'lucide-react';
import type { AppProfile } from './types';

type FieldKey = Exclude<keyof AppProfile, 'updatedAt'>;
type FieldConfig = { key: FieldKey; label: string; placeholder: string; rows?: number };
type Props = {
    profile: AppProfile;
    loading: boolean;
    saving: boolean;
    onChange: (profile: AppProfile) => void;
    onSave: (profile: AppProfile) => void;
};

const fields: FieldConfig[] = [
    { key: 'appName', label: 'アプリ名', placeholder: '例: Focus Mate' },
    { key: 'targetAudience', label: 'ターゲット', placeholder: '例: 忙しい社会人、習慣化したい人' },
    { key: 'valueProposition', label: '価値訴求', placeholder: '例: 1日3分で続けられる記録体験' },
    { key: 'painPoints', label: '悩み', placeholder: '例: 続かない、振り返りが面倒', rows: 2 },
    { key: 'tone', label: 'トーン', placeholder: '例: 親しみやすく誠実' },
    { key: 'landingUrl', label: 'URL', placeholder: 'https://example.com' },
];

function ProfileField({ field, value, onChange }: {
    field: FieldConfig;
    value: string;
    onChange: (key: FieldKey, value: string) => void;
}) {
    const className = 'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100';
    return (
        <label className="grid gap-1 text-sm font-medium text-neutral-700">
            {field.label}
            {field.rows ? (
                <textarea className={className} rows={field.rows} value={value} onChange={(e) => onChange(field.key, e.target.value)} />
            ) : (
                <input className={className} value={value} placeholder={field.placeholder} onChange={(e) => onChange(field.key, e.target.value)} />
            )}
        </label>
    );
}

export default function AppProfilePanel({ profile, loading, saving, onChange, onSave }: Props) {
    const update = (key: FieldKey, value: string) => onChange({ ...profile, [key]: value });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        onSave(profile);
    };

    return (
        <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-neutral-950">
                <Smartphone size={18} className="text-sky-600" /> アプリ情報
            </h2>
            {loading ? <p className="text-sm text-neutral-500">読み込み中...</p> : (
                <form onSubmit={submit} className="grid gap-3">
                    {fields.map((field) => (
                        <ProfileField key={field.key} field={field} value={profile[field.key]} onChange={update} />
                    ))}
                    <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={saving}>
                        <Save size={16} /> {saving ? '保存中...' : '保存'}
                    </button>
                </form>
            )}
        </section>
    );
}
