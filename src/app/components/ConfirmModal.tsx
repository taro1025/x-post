'use client';

import { X, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
};

type ModalActionsProps = Pick<
    ConfirmModalProps,
    'onClose' | 'onConfirm' | 'confirmText' | 'cancelText' | 'isDangerous'
>;

function getConfirmButtonClass(isDangerous: boolean) {
    const color = isDangerous
        ? 'bg-red-600 hover:bg-red-500 hover:shadow-red-500/20'
        : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20';
    return `px-4 py-2 rounded-lg text-white font-medium shadow-lg transition-all ${color}`;
}

function CloseButton({ onClose }: Pick<ConfirmModalProps, 'onClose'>) {
    return (
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
            <X size={20} />
        </button>
    );
}

function ModalHeader({ title, isDangerous }: Pick<ConfirmModalProps, 'title' | 'isDangerous'>) {
    const tone = isDangerous ? 'bg-red-900/30 text-red-500' : 'bg-indigo-900/30 text-indigo-500';
    return (
        <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${tone}`}>
                <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
        </div>
    );
}

function ModalActions({
    onClose,
    onConfirm,
    confirmText,
    cancelText,
    isDangerous = false,
}: ModalActionsProps) {
    return (
        <div className="flex gap-3 justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors font-medium border border-transparent hover:border-slate-700"
            >
                {cancelText}
            </button>
            <button
                onClick={() => { onConfirm(); onClose(); }}
                className={getConfirmButtonClass(isDangerous)}
            >
                {confirmText}
            </button>
        </div>
    );
}

function useModalVisibility(isOpen: boolean) {
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        const delay = isOpen ? 0 : 300;
        const timer = setTimeout(() => setIsVisible(isOpen), delay);
        return () => clearTimeout(timer);
    }, [isOpen]);

    return isVisible;
}

function ModalFrame({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDangerous = false,
}: ConfirmModalProps) {
    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <CloseButton onClose={onClose} />
                <div className="p-6">
                    <ModalHeader title={title} isDangerous={isDangerous} />
                    <p className="text-slate-400 mb-8 leading-relaxed">{message}</p>
                    <ModalActions onClose={onClose} onConfirm={onConfirm} confirmText={confirmText} cancelText={cancelText} isDangerous={isDangerous} />
                </div>
            </div>
        </div>
    );
}

export default function ConfirmModal(props: ConfirmModalProps) {
    const isVisible = useModalVisibility(props.isOpen);

    if (!isVisible && !props.isOpen) return null;

    return <ModalFrame {...props} />;
}
