"use client";

import { useState } from "react";
import { Download, Eye, Copy, FileText, Check } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface OutputGridProps {
    files: Record<string, string>;
    projectName: string;
    onPreview: (name: string, content: string) => void;
}

export default function OutputGrid({ files, projectName, onPreview }: OutputGridProps) {
    const [copiedFile, setCopiedFile] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const fileEntries = Object.entries(files);

    const copyContent = async (name: string, content: string) => {
        await navigator.clipboard.writeText(content);
        setCopiedFile(name);
        setTimeout(() => setCopiedFile(null), 2000);
    };

    const downloadZip = async () => {
        setDownloading(true);
        try {
            const zip = new JSZip();
            const folder = zip.folder(projectName || "antigravity-output");
            fileEntries.forEach(([name, content]) => folder?.file(name, content));
            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, `${projectName || "antigravity-output"}.zip`);
        } finally {
            setDownloading(false);
        }
    };

    if (fileEntries.length === 0) return null;

    return (
        <section className="content-section" id="section-output">
            <div className="section-header-row">
                <h2 className="section-title text-secondary">Output — Antigravity Symphony</h2>
                <button onClick={downloadZip} disabled={downloading} className="btn-ghost">
                    <Download className="h-4 w-4" />
                    {downloading ? "Downloading…" : "Download ZIP"}
                </button>
            </div>
            <p className="text-xs text-muted mb-4">Files are read-only. Use the terminal to request changes.</p>

            <div className="output-grid">
                {fileEntries.map(([name, content]) => (
                    <div key={name} className="output-card">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-muted" />
                            <span className="text-sm font-semibold text-foreground">{name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onPreview(name, content)}
                                className="output-card-action"
                            >
                                <Eye className="h-3.5 w-3.5" /> Preview
                            </button>
                            <button
                                onClick={() => copyContent(name, content)}
                                className="output-card-action"
                            >
                                {copiedFile === name ? (
                                    <><Check className="h-3.5 w-3.5 text-success" /> Copied</>
                                ) : (
                                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-6">
                <button className="btn-manifest">
                    ✡ Review & Confirm — The Manifest
                </button>
            </div>
        </section>
    );
}
