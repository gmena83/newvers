"use client";

import Link from "next/link";
import { Rocket } from "lucide-react";

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 bg-[rgba(15,10,26,0.85)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 transition-colors group-hover:bg-primary/25">
                        <Rocket className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground">
                        Antigravity{" "}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Symphony
                        </span>
                    </span>
                </Link>

                <nav className="flex items-center gap-6">
                    <Link
                        href="/new"
                        className="btn-primary text-sm py-2 px-5"
                    >
                        New Project
                    </Link>
                </nav>
            </div>
        </header>
    );
}
