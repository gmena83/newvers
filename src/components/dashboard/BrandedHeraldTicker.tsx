import React from "react";
import { mockLinks } from "@/data/mockData";
import { Link2, MousePointerClick } from "lucide-react";

const BrandedHeraldTicker: React.FC = () => {
  const doubled = [...mockLinks, ...mockLinks];

  return (
    <div className="glass-panel py-3 overflow-hidden">
      <div className="flex items-center gap-2 px-4 mb-2">
        <Link2 className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Branded Herald</span>
        <span className="text-xs text-muted-foreground ml-1">via Rebrandly</span>
      </div>
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee gap-6 px-4">
          {doubled.map((link, i) => (
            <div key={`${link.id}-${i}`} className="flex items-center gap-3 shrink-0 bg-secondary/30 rounded-lg px-3 py-2">
              <span className="text-primary font-mono text-sm font-medium">{link.shortUrl}</span>
              <span className="text-muted-foreground text-xs">→ {link.destination}</span>
              <span className="flex items-center gap-1 text-accent text-xs font-semibold">
                <MousePointerClick className="w-3 h-3" />
                {link.clicks.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandedHeraldTicker;
