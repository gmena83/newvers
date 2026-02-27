"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { GeneratorProvider, useGenerator } from "@/contexts/GeneratorContext";
import GeneratorHeader from "@/components/generator/GeneratorHeader";
import IntakeForm from "@/components/generator/IntakeForm";
import PipelineDashboard from "@/components/generator/PipelineDashboard";

const GeneratorContent: React.FC = () => {
    const { pipelineState } = useGenerator();

    return (
        <div
            className="min-h-screen flex flex-col bg-[#050505] text-foreground"
            style={{
                backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
                backgroundSize: "40px 40px",
            }}
        >
            <GeneratorHeader />
            <AnimatePresence mode="wait">
                {pipelineState === "idle" ? (
                    <IntakeForm key="intake" />
                ) : (
                    <PipelineDashboard key="pipeline" />
                )}
            </AnimatePresence>
        </div>
    );
};

export default function GeneratorPage() {
    return (
        <GeneratorProvider>
            <GeneratorContent />
        </GeneratorProvider>
    );
}
