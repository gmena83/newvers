import React from "react";

const DashboardFooter: React.FC = () => (
  <footer className="flex flex-col sm:flex-row items-center justify-center gap-4 px-6 py-4 text-xs text-muted-foreground border-t border-border/30">
    <span>
      Powered by{" "}
      <a href="https://antigravity.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
        Antigravity
      </a>{" "}
      by{" "}
      <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors">
        Google
      </a>
    </span>
    <span className="hidden sm:inline text-muted-foreground/30">•</span>
    <span>
      Created by{" "}
      <a href="https://menatech.cloud" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors font-medium">
        Menatech
      </a>{" "}
      AI Agents
    </span>
  </footer>
);

export default DashboardFooter;
