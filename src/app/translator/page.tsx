"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import TranslatorHeader from "@/components/translator/TranslatorHeader";
import TranslatorSidebar from "@/components/translator/TranslatorSidebar";
import SmartIntakeForm from "@/components/translator/SmartIntakeForm";
import TranslatorTerminal from "@/components/translator/TranslatorTerminal";

export default function TranslatorPage() {
    const [flightSteps, setFlightSteps] = useState([
        { label: "Mission & Details", complete: false },
        { label: "Tech Stack", complete: false },
        { label: "Guiding Questions", complete: false },
        { label: "Conflict Resolution", complete: false },
        { label: "Output Generated", complete: false },
    ]);

    const handleFieldChange = useCallback((fields: Record<string, boolean>) => {
        setFlightSteps((prev) => prev.map((step) => {
            if (step.label === "Mission & Details") return { ...step, complete: !!fields.mission };
            if (step.label === "Tech Stack") return { ...step, complete: !!fields.techStack };
            if (step.label === "Guiding Questions") return { ...step, complete: !!fields.roadmap };
            return step;
        }));
    }, []);

    const handleNewProject = () => {
        setFlightSteps((prev) => prev.map((s) => ({ ...s, complete: false })));
    };

    return (
        <div
            className="min-h-screen flex flex-col relative"
            style={{
                backgroundColor: "#050505",
                backgroundImage: `
          linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
                backgroundSize: "40px 40px",
            }}
        >
            <TranslatorHeader />
            <div className="flex flex-1 px-4 gap-4 overflow-hidden">
                <TranslatorSidebar flightSteps={flightSteps} onNewProject={handleNewProject} />
                <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="flex-1 overflow-y-auto pr-2">
                        <SmartIntakeForm onFieldChange={handleFieldChange} />
                    </div>
                    <TranslatorTerminal />
                </motion.main>
            </div>
        </div>
    );
}
