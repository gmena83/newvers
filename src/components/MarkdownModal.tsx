"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Copy, Check } from "lucide-react";

interface MarkdownModalProps {
    title: string;
    content: string;
    onClose: () => void;
}

export default function MarkdownModal({
    title,
    content,
    onClose,
}: MarkdownModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl border border-white/10 bg-[#0d0d14] shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
                    <h2 className="text-base font-bold font-mono text-foreground">
                        {title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCopy} className="btn-ghost text-xs">
                            {copied ? (
                                <><Check className="h-3.5 w-3.5 text-success" /> Copied</>
                            ) : (
                                <><Copy className="h-3.5 w-3.5" /> Copy</>
                            )}
                        </button>
                        <button onClick={onClose} className="btn-ghost p-2" aria-label="Close modal">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
