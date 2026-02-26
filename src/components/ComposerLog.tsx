"use client";

import { useRef, useEffect } from "react";

interface LogEntry {
    prefix: string;
    message: string;
    color?: string;
}

interface ComposerLogProps {
    entries: LogEntry[];
}

export default function ComposerLog({ entries }: ComposerLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries]);

    return (
        <section className="composer-log">
            {/* Traffic light dots + title */}
            <div className="composer-log-header">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <span className="composer-log-title">COMPOSER&apos;S LOG // v1.0</span>
            </div>

            {/* Log entries */}
            <div ref={scrollRef} className="composer-log-body">
                {entries.length === 0 && (
                    <p className="text-muted text-xs">Waiting for generation to start…</p>
                )}
                {entries.map((entry, i) => (
                    <div key={i} className="composer-log-line">
                        <span style={{ color: entry.color || "#94a3b8" }}>[{entry.prefix}]</span>
                        <span className="text-foreground"> &gt; {entry.message}</span>
                    </div>
                ))}
            </div>

            {/* Input bar */}
            <div className="composer-log-input">
                <span className="text-muted">▸</span>
                <input
                    type="text"
                    placeholder="Type a command..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground"
                />
            </div>
        </section>
    );
}
