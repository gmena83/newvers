"use client";

import { useState } from "react";
import { Eye, Copy, Check, FileText } from "lucide-react";

interface FileCardProps {
    name: string;
    label: string;
    description: string;
    content: string;
    index: number;
    onPreview: () => void;
}

const iconColors = [
    "text-primary",
    "text-secondary",
    "text-accent",
    "text-success",
    "text-warning",
    "text-primary",
    "text-secondary",
    "text-accent",
    "text-success",
    "text-warning",
];

const bgColors = [
    "bg-primary/10",
    "bg-secondary/10",
    "bg-accent/10",
    "bg-success/10",
    "bg-warning/10",
    "bg-primary/10",
    "bg-secondary/10",
    "bg-accent/10",
    "bg-success/10",
    "bg-warning/10",
];

export default function FileCard({
    name,
    label,
    description,
    content,
    index,
    onPreview,
}: FileCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const lineCount = content.split("\n").length;

    return (
        <div className="glass-card flex flex-col p-5 h-full">
            {/* Icon + Title */}
            <div className="flex items-start gap-3 mb-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgColors[index]}`}
                >
                    <FileText className={`h-5 w-5 ${iconColors[index]}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold font-mono text-foreground truncate">
                        {name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">{label}</p>
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted/80 leading-relaxed mb-4 flex-1">
                {description}
            </p>

            {/* Stats */}
            <div className="mb-4 flex items-center gap-4 text-xs text-muted/60">
                <span>{lineCount} lines</span>
                <span>{(content.length / 1024).toFixed(1)} KB</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button onClick={onPreview} className="btn-secondary flex-1 text-xs py-2">
                    <Eye className="h-3.5 w-3.5" /> Preview
                </button>
                <button onClick={handleCopy} className="btn-ghost text-xs py-2 px-3">
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                        <Copy className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}
