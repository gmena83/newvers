"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SymphonyProvider, useSymphony } from "@/contexts/SymphonyContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import NodeGraph from "@/components/dashboard/NodeGraph";
import CommunicationHub from "@/components/dashboard/CommunicationHub";
import BrandedHeraldTicker from "@/components/dashboard/BrandedHeraldTicker";
import OverturePanel from "@/components/dashboard/OverturePanel";
import VisualSoulPanel from "@/components/dashboard/VisualSoulPanel";
import FoundationPanel from "@/components/dashboard/FoundationPanel";
import CrescendoPanel from "@/components/dashboard/CrescendoPanel";
import OvationPanel from "@/components/dashboard/OvationPanel";
import TurboOverlay from "@/components/dashboard/TurboOverlay";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DashboardContent: React.FC = () => {
  const { mode } = useSymphony();
  const isTurbo = mode === "TURBO";

  return (
    <div className={`min-h-screen transition-colors duration-800 ${isTurbo ? "turbo-mode" : "bg-background"}`}>
      <DashboardHeader />

      <AnimatePresence mode="wait">
        {isTurbo ? (
          <TurboOverlay key="turbo" />
        ) : (
          <motion.main
            key="orchestra"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="px-4 sm:px-6 pb-6 space-y-6"
          >
            <motion.section variants={fadeUp}>
              <NodeGraph />
            </motion.section>
            <motion.section variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CommunicationHub />
              <div className="flex flex-col gap-4">
                <BrandedHeraldTicker />
              </div>
            </motion.section>
            <motion.section variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <OverturePanel />
              <VisualSoulPanel />
              <FoundationPanel />
            </motion.section>
            <motion.section variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CrescendoPanel />
              <OvationPanel />
            </motion.section>
          </motion.main>
        )}
      </AnimatePresence>

      <DashboardFooter />
    </div>
  );
};

export default function Home() {
  return (
    <SymphonyProvider>
      <DashboardContent />
    </SymphonyProvider>
  );
}
