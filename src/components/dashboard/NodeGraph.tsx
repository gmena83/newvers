import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { agentNodes, type AgentNode } from "@/data/mockData";

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  data: AgentNode | null;
  isDragging: boolean;
  radius: number;
}

const STATUS_COLORS: Record<string, string> = {
  active: "hsl(217, 90%, 61%)",
  processing: "hsl(45, 93%, 47%)",
  idle: "hsl(215, 15%, 45%)",
};

// Enhanced Agent Icons with official logo adaptations + musician silhouettes
const AgentIcon: React.FC<{ id: string; size: number }> = ({ id, size }) => {
  const s = size * 0.5;
  
  // Shared musician body base (~40%)
  const body = (
    <>
      <circle cx={0} cy={-s * 0.25} r={s * 0.18} fill="currentColor" opacity={0.85} />
      <path d={`M${-s * 0.13},${-s * 0.07} Q0,${s * 0.12} ${s * 0.13},${-s * 0.07}`} fill="currentColor" opacity={0.6} />
    </>
  );

  const icons: Record<string, React.ReactNode> = {
    openai: (
      <g>
        {body}
        {/* OpenAI hexagonal spark logo adapted as piano keys */}
        <g transform={`translate(0, ${s * 0.15})`}>
          {/* Hexagonal spark outline */}
          <path d={`M0,${-s*0.18} L${s*0.16},${-s*0.09} L${s*0.16},${s*0.09} L0,${s*0.18} L${-s*0.16},${s*0.09} L${-s*0.16},${-s*0.09} Z`}
            fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.7} />
          {/* Inner spark lines */}
          <line x1={0} y1={-s*0.18} x2={0} y2={-s*0.06} stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <line x1={s*0.16} y1={-s*0.09} x2={s*0.06} y2={-s*0.03} stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <line x1={s*0.16} y1={s*0.09} x2={s*0.06} y2={s*0.03} stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <line x1={0} y1={s*0.18} x2={0} y2={s*0.06} stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <line x1={-s*0.16} y1={s*0.09} x2={-s*0.06} y2={s*0.03} stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <line x1={-s*0.16} y1={-s*0.09} x2={-s*0.06} y2={-s*0.03} stroke="currentColor" strokeWidth={1} opacity={0.5} />
          {/* Piano keys emanating below */}
          {[-0.12, -0.06, 0, 0.06, 0.12].map((x, i) => (
            <rect key={i} x={x * s - 1.5} y={s * 0.2} width={3} height={s * 0.12} rx={0.5} fill="currentColor" opacity={0.6 + i * 0.05} />
          ))}
          <rect x={-s * 0.15} y={s * 0.19} width={s * 0.3} height={s * 0.02} fill="currentColor" opacity={0.4} />
        </g>
      </g>
    ),
    anthropic: (
      <g>
        {body}
        {/* Anthropic "A" mark integrated into violin body */}
        <g transform={`translate(${s * 0.15}, ${-s * 0.05})`}>
          {/* Violin body shape */}
          <ellipse cx={0} cy={0} rx={s * 0.1} ry={s * 0.2} fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
          <ellipse cx={0} cy={-s * 0.08} rx={s * 0.07} ry={s * 0.06} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.4} />
          <ellipse cx={0} cy={s * 0.08} rx={s * 0.07} ry={s * 0.06} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.4} />
          {/* Anthropic "A" in violin center */}
          <path d={`M${-s*0.04},${s*0.06} L0,${-s*0.06} L${s*0.04},${s*0.06}`} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.9} />
          <line x1={-s*0.025} y1={s*0.02} x2={s*0.025} y2={s*0.02} stroke="currentColor" strokeWidth={1} opacity={0.7} />
          {/* Violin neck + strings */}
          <line x1={0} y1={-s*0.2} x2={0} y2={-s*0.35} stroke="currentColor" strokeWidth={1.5} opacity={0.6} />
          <line x1={-s*0.02} y1={-s*0.2} x2={-s*0.02} y2={s*0.2} stroke="currentColor" strokeWidth={0.5} opacity={0.3} />
          <line x1={s*0.02} y1={-s*0.2} x2={s*0.02} y2={s*0.2} stroke="currentColor" strokeWidth={0.5} opacity={0.3} />
        </g>
      </g>
    ),
    perplexity: (
      <g>
        {body}
        {/* Perplexity globe/compass merged with telescope */}
        <g transform={`translate(${s * 0.18}, ${-s * 0.08})`}>
          {/* Globe circle */}
          <circle cx={0} cy={0} r={s * 0.13} fill="none" stroke="currentColor" strokeWidth={1.3} opacity={0.7} />
          {/* Globe latitude lines */}
          <ellipse cx={0} cy={0} rx={s * 0.13} ry={s * 0.05} fill="none" stroke="currentColor" strokeWidth={0.7} opacity={0.4} />
          <ellipse cx={0} cy={0} rx={s * 0.05} ry={s * 0.13} fill="none" stroke="currentColor" strokeWidth={0.7} opacity={0.4} />
          {/* Compass needle / search arrow */}
          <line x1={0} y1={-s*0.06} x2={0} y2={s*0.06} stroke="currentColor" strokeWidth={1.5} opacity={0.8} />
          <polygon points={`0,${-s*0.08} ${-s*0.02},${-s*0.04} ${s*0.02},${-s*0.04}`} fill="currentColor" opacity={0.8} />
          {/* Telescope tube extending */}
          <line x1={s*0.1} y1={-s*0.1} x2={s*0.25} y2={-s*0.22} stroke="currentColor" strokeWidth={2} opacity={0.5} />
          <circle cx={s*0.27} cy={-s*0.24} r={s*0.04} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.6} />
        </g>
      </g>
    ),
    elevenlabs: (
      <g>
        {body}
        {/* ElevenLabs "XI" mark with sound wave arcs */}
        <g transform={`translate(${s * 0.12}, ${s * 0.05})`}>
          {/* XI text mark */}
          <text x={-s*0.04} y={s*0.02} fontSize={s*0.16} fontWeight="bold" fill="currentColor" opacity={0.9} textAnchor="middle" dominantBaseline="middle">XI</text>
          {/* Radiating sound wave arcs */}
          {[0.14, 0.22, 0.3].map((r, i) => (
            <path key={i} d={`M${s * r * 0.7},${-s * r} A${s * r},${s * r} 0 0,1 ${s * r * 0.7},${s * r}`}
              fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.25 + i * 0.15} />
          ))}
          {/* Sound wave arcs on left */}
          {[0.14, 0.22, 0.3].map((r, i) => (
            <path key={`l${i}`} d={`M${-s * r * 0.7 - s*0.08},${-s * r} A${s * r},${s * r} 0 0,0 ${-s * r * 0.7 - s*0.08},${s * r}`}
              fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.25 + i * 0.15} />
          ))}
        </g>
      </g>
    ),
    firebase: (
      <g>
        {body}
        {/* Firebase flame icon integrated into drum/percussion */}
        <g transform={`translate(0, ${s * 0.12})`}>
          {/* Drum body */}
          <ellipse cx={0} cy={s * 0.08} rx={s * 0.18} ry={s * 0.06} fill="currentColor" opacity={0.3} />
          <rect x={-s * 0.18} y={-s * 0.02} width={s * 0.36} height={s * 0.1} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.4} />
          <ellipse cx={0} cy={-s * 0.02} rx={s * 0.18} ry={s * 0.06} fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.5} />
          {/* Firebase flame */}
          <path d={`M0,${-s*0.22} C${s*0.08},${-s*0.14} ${s*0.12},${-s*0.06} ${s*0.08},${-s*0.01} L${s*0.12},${-s*0.08} C${s*0.06},${-s*0.04} 0,${-s*0.02} ${-s*0.04},${-s*0.08} L${-s*0.08},${-s*0.01} C${-s*0.12},${-s*0.06} ${-s*0.08},${-s*0.14} 0,${-s*0.22} Z`}
            fill="currentColor" opacity={0.7} />
          {/* Drumsticks */}
          <line x1={-s*0.22} y1={-s*0.15} x2={-s*0.05} y2={-s*0.03} stroke="currentColor" strokeWidth={1.5} opacity={0.5} strokeLinecap="round" />
          <line x1={s*0.22} y1={-s*0.15} x2={s*0.05} y2={-s*0.03} stroke="currentColor" strokeWidth={1.5} opacity={0.5} strokeLinecap="round" />
        </g>
      </g>
    ),
    supabase: (
      <g>
        {body}
        {/* Supabase lightning bolt atop database cylinders */}
        <g transform={`translate(0, ${s * 0.1})`}>
          {/* Database stack */}
          <ellipse cx={0} cy={-s * 0.02} rx={s * 0.14} ry={s * 0.05} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <rect x={-s * 0.14} y={-s * 0.02} width={s * 0.28} height={s * 0.12} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.4} />
          <ellipse cx={0} cy={s * 0.1} rx={s * 0.14} ry={s * 0.05} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.5} />
          <ellipse cx={0} cy={s * 0.18} rx={s * 0.14} ry={s * 0.05} fill="currentColor" opacity={0.2} />
          <rect x={-s * 0.14} y={s * 0.1} width={s * 0.28} height={s * 0.08} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.4} />
          {/* Lightning bolt (Supabase logo) */}
          <path d={`M${s*0.02},${-s*0.22} L${-s*0.04},${-s*0.06} L${s*0.02},${-s*0.06} L${-s*0.02},${s*0.02}`}
            fill="none" stroke="currentColor" strokeWidth={2} opacity={0.9} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    ),
    activepieces: (
      <g>
        {body}
        {/* Activepieces puzzle piece transformed into conductor's baton */}
        <g transform={`translate(${s * 0.1}, ${s * 0.02})`}>
          {/* Puzzle piece shape */}
          <path d={`M${-s*0.1},${-s*0.1} L${s*0.02},${-s*0.1} C${s*0.02},${-s*0.16} ${s*0.1},${-s*0.16} ${s*0.1},${-s*0.1} L${s*0.14},${-s*0.1} L${s*0.14},${s*0.02} C${s*0.08},${s*0.02} ${s*0.08},${s*0.1} ${s*0.14},${s*0.1} L${s*0.14},${s*0.14} L${-s*0.1},${s*0.14} Z`}
            fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.6} />
          {/* Baton through puzzle */}
          <line x1={-s*0.15} y1={s*0.15} x2={s*0.2} y2={-s*0.2} stroke="currentColor" strokeWidth={2} opacity={0.8} strokeLinecap="round" />
          <circle cx={s*0.2} cy={-s*0.2} r={2.5} fill="currentColor" opacity={0.9} />
        </g>
      </g>
    ),
  };

  return <g>{icons[id] || body}</g>;
};

// Tron Legacy-style Director face — The Dude Lebowski in neon contour lines
const DirectorIcon: React.FC<{ size: number }> = ({ size }) => {
  const s = size * 0.55;
  const c = "hsl(217, 90%, 70%)"; // Cyan/blue glow
  const cBright = "hsl(217, 95%, 82%)";

  return (
    <g>
      {/* Face outline — Tron neon contour */}
      <path d={`M${-s*0.22},${-s*0.1} C${-s*0.25},${-s*0.35} ${-s*0.18},${-s*0.55} 0,${-s*0.55} C${s*0.18},${-s*0.55} ${s*0.25},${-s*0.35} ${s*0.22},${-s*0.1} C${s*0.22},${s*0.05} ${s*0.18},${s*0.15} ${s*0.12},${s*0.22} L${-s*0.12},${s*0.22} C${-s*0.18},${s*0.15} ${-s*0.22},${s*0.05} ${-s*0.22},${-s*0.1} Z`}
        fill="none" stroke={c} strokeWidth={1.8} opacity={0.8}>
        <animate attributeName="opacity" values="0.8;0.5;0.8" dur="3s" repeatCount="indefinite" />
      </path>

      {/* Long flowing hair — Lebowski style */}
      <path d={`M${-s*0.22},${-s*0.15} C${-s*0.28},${-s*0.05} ${-s*0.32},${s*0.1} ${-s*0.28},${s*0.3}`}
        fill="none" stroke={c} strokeWidth={1.2} opacity={0.5} />
      <path d={`M${-s*0.24},${-s*0.2} C${-s*0.3},${-s*0.08} ${-s*0.35},${s*0.08} ${-s*0.3},${s*0.28}`}
        fill="none" stroke={c} strokeWidth={0.8} opacity={0.35} />
      <path d={`M${s*0.22},${-s*0.15} C${s*0.28},${-s*0.05} ${s*0.32},${s*0.1} ${s*0.28},${s*0.3}`}
        fill="none" stroke={c} strokeWidth={1.2} opacity={0.5} />
      <path d={`M${s*0.24},${-s*0.2} C${s*0.3},${-s*0.08} ${s*0.35},${s*0.08} ${s*0.3},${s*0.28}`}
        fill="none" stroke={c} strokeWidth={0.8} opacity={0.35} />
      {/* Top hair flowing back */}
      <path d={`M${-s*0.15},${-s*0.52} C${-s*0.2},${-s*0.58} ${-s*0.25},${-s*0.5} ${-s*0.26},${-s*0.35}`}
        fill="none" stroke={c} strokeWidth={1} opacity={0.4} />
      <path d={`M${s*0.15},${-s*0.52} C${s*0.2},${-s*0.58} ${s*0.25},${-s*0.5} ${s*0.26},${-s*0.35}`}
        fill="none" stroke={c} strokeWidth={1} opacity={0.4} />

      {/* Round sunglasses — signature Dude */}
      <circle cx={-s*0.1} cy={-s*0.25} r={s*0.09} fill="hsl(230, 25%, 8%)" stroke={cBright} strokeWidth={1.3} opacity={0.9}>
        <animate attributeName="stroke-opacity" values="0.9;0.6;0.9" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx={s*0.1} cy={-s*0.25} r={s*0.09} fill="hsl(230, 25%, 8%)" stroke={cBright} strokeWidth={1.3} opacity={0.9}>
        <animate attributeName="stroke-opacity" values="0.9;0.6;0.9" dur="2.5s" repeatCount="indefinite" />
      </circle>
      {/* Bridge between glasses */}
      <line x1={-s*0.01} y1={-s*0.25} x2={s*0.01} y2={-s*0.25} stroke={cBright} strokeWidth={1.2} opacity={0.7} />
      {/* Lens reflections (Tron-style light lines) */}
      <line x1={-s*0.14} y1={-s*0.28} x2={-s*0.06} y2={-s*0.22} stroke={cBright} strokeWidth={0.6} opacity={0.4} />
      <line x1={s*0.06} y1={-s*0.28} x2={s*0.14} y2={-s*0.22} stroke={cBright} strokeWidth={0.6} opacity={0.4} />

      {/* Nose contour */}
      <path d={`M0,${-s*0.18} L${s*0.02},${-s*0.08} L${-s*0.02},${-s*0.06}`}
        fill="none" stroke={c} strokeWidth={0.8} opacity={0.45} />

      {/* Goatee */}
      <path d={`M${-s*0.06},${s*0.05} C${-s*0.06},${s*0.14} 0,${s*0.2} ${s*0.06},${s*0.05}`}
        fill="none" stroke={c} strokeWidth={1} opacity={0.5} />
      <path d={`M${-s*0.04},${s*0.08} C${-s*0.03},${s*0.14} ${s*0.03},${s*0.14} ${s*0.04},${s*0.08}`}
        fill="none" stroke={c} strokeWidth={0.7} opacity={0.35} />

      {/* Mouth line */}
      <path d={`M${-s*0.08},${s*0.02} C${-s*0.04},${s*0.05} ${s*0.04},${s*0.05} ${s*0.08},${s*0.02}`}
        fill="none" stroke={c} strokeWidth={0.8} opacity={0.4} />

      {/* Tron-style contour grid lines across face */}
      <path d={`M${-s*0.2},${-s*0.3} L${s*0.2},${-s*0.3}`} fill="none" stroke={c} strokeWidth={0.4} opacity={0.15} />
      <path d={`M${-s*0.22},${-s*0.15} L${s*0.22},${-s*0.15}`} fill="none" stroke={c} strokeWidth={0.4} opacity={0.15} />
      <path d={`M${-s*0.2},${0} L${s*0.2},${0}`} fill="none" stroke={c} strokeWidth={0.4} opacity={0.15} />

      {/* Conductor baton — light-line style */}
      <line x1={s*0.18} y1={s*0.1} x2={s*0.48} y2={-s*0.35} stroke={cBright} strokeWidth={1.8} strokeLinecap="round" opacity={0.7}>
        <animate attributeName="opacity" values="0.7;0.4;0.7" dur="2s" repeatCount="indefinite" />
      </line>
      <circle cx={s*0.48} cy={-s*0.35} r={2.5} fill={cBright} opacity={0.9}>
        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
      </circle>
    </g>
  );
};

const NodeGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animFrameRef = useRef<number>(0);
  const [renderTick, setRenderTick] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 500 });
  const dragRef = useRef<{ nodeId: string | null; offsetX: number; offsetY: number }>({ nodeId: null, offsetX: 0, offsetY: 0 });

  useEffect(() => {
    const w = dimensions.w;
    const h = dimensions.h;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.32;
    const nodes: Node[] = [
      { id: "director", x: cx, y: cy, vx: 0, vy: 0, targetX: cx, targetY: cy, data: null, isDragging: false, radius: 45 },
    ];
    agentNodes.forEach((agent, i) => {
      const angle = (i / agentNodes.length) * Math.PI * 2 - Math.PI / 2;
      const tx = cx + Math.cos(angle) * radius;
      const ty = cy + Math.sin(angle) * radius;
      nodes.push({ id: agent.id, x: tx + (Math.random() - 0.5) * 20, y: ty + (Math.random() - 0.5) * 20, vx: 0, vy: 0, targetX: tx, targetY: ty, data: agent, isDragging: false, radius: 32 });
    });
    nodesRef.current = nodes;
  }, [dimensions]);

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDimensions({ w: width, h: height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let running = true;
    const simulate = () => {
      if (!running) return;
      const nodes = nodesRef.current;
      const damping = 0.85;
      const springK = 0.03;
      for (const node of nodes) {
        if (node.isDragging) continue;
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        node.vx += dx * springK;
        node.vy += dy * springK;
        for (const other of nodes) {
          if (other.id === node.id) continue;
          const ox = node.x - other.x;
          const oy = node.y - other.y;
          const dist = Math.sqrt(ox * ox + oy * oy) || 1;
          const minDist = node.radius + other.radius + 10;
          if (dist < minDist) {
            const force = (minDist - dist) * 0.05;
            node.vx += (ox / dist) * force;
            node.vy += (oy / dist) * force;
          }
        }
        node.vx *= damping;
        node.vy *= damping;
        node.x += node.vx;
        node.y += node.vy;
      }
      setRenderTick((t) => t + 1);
      animFrameRef.current = requestAnimationFrame(simulate);
    };
    animFrameRef.current = requestAnimationFrame(simulate);
    return () => { running = false; cancelAnimationFrame(animFrameRef.current); };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (!node) return;
    node.isDragging = true;
    dragRef.current = { nodeId, offsetX: node.x - (e.clientX - rect.left), offsetY: node.y - (e.clientY - rect.top) };
    const handleMove = (me: MouseEvent) => {
      const n = nodesRef.current.find((n) => n.id === nodeId);
      if (!n) return;
      n.x = me.clientX - rect.left + dragRef.current.offsetX;
      n.y = me.clientY - rect.top + dragRef.current.offsetY;
      n.targetX = n.x;
      n.targetY = n.y;
    };
    const handleUp = () => {
      const n = nodesRef.current.find((n) => n.id === nodeId);
      if (n) n.isDragging = false;
      dragRef.current.nodeId = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }, []);

  const nodes = nodesRef.current;
  const director = nodes.find((n) => n.id === "director");
  void renderTick;

  return (
    <div className="relative w-full" style={{ height: "clamp(350px, 50vh, 550px)" }}>
      <svg ref={svgRef} width={dimensions.w} height={dimensions.h} className="w-full h-full">
        <defs>
          <radialGradient id="bg-glow">
            <stop offset="0%" stopColor="hsl(217, 90%, 61%)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {director && <circle cx={director.x} cy={director.y} r={200} fill="url(#bg-glow)" />}

        {director && nodes.filter((n) => n.id !== "director").map((node) => {
          const agent = node.data;
          const color = agent ? agent.color : "#4285f4";
          return (
            <g key={`line-${node.id}`}>
              <line x1={director.x} y1={director.y} x2={node.x} y2={node.y} stroke={color} strokeWidth={1.5} opacity={0.25} />
              {agent?.status === "active" && [0, 0.33, 0.66].map((offset, i) => {
                const t = ((Date.now() / 2000 + offset) % 1);
                const px = director.x + (node.x - director.x) * t;
                const py = director.y + (node.y - director.y) * t;
                return <circle key={i} cx={px} cy={py} r={2} fill={color} opacity={0.6 + t * 0.3} />;
              })}
            </g>
          );
        })}

        {nodes.filter((n) => n.id !== "director").map((node) => {
          const agent = node.data!;
          const isSelected = selectedNode === node.id;
          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={() => setSelectedNode(isSelected ? null : node.id)}
              className="cursor-grab active:cursor-grabbing">
              <circle r={node.radius + 6} fill="none" stroke={agent.color} strokeWidth={isSelected ? 2 : 1} opacity={isSelected ? 0.6 : 0.2} filter="url(#glow)" />
              <circle r={node.radius} fill="hsl(230, 20%, 10%)" stroke={agent.color} strokeWidth={1.5} opacity={0.9} />
              <circle cx={node.radius * 0.6} cy={-node.radius * 0.6} r={4} fill={STATUS_COLORS[agent.status]} />
              <g style={{ color: agent.color }}><AgentIcon id={agent.id} size={node.radius * 2} /></g>
              <text y={node.radius + 16} textAnchor="middle" fill="hsl(210, 40%, 85%)" fontSize={11} fontWeight={500}>{agent.name}</text>
            </g>
          );
        })}

        {director && (
          <g transform={`translate(${director.x}, ${director.y})`}
            onMouseDown={(e) => handleMouseDown(e, "director")}
            onClick={() => setSelectedNode(selectedNode === "director" ? null : "director")}
            className="cursor-grab active:cursor-grabbing">
            <circle r={director.radius + 10} fill="none" stroke="hsl(217, 90%, 61%)" strokeWidth={2} opacity={0.3} filter="url(#glow)" />
            <circle r={director.radius + 4} fill="none" stroke="hsl(217, 89%, 76%)" strokeWidth={1} opacity={0.15}>
              <animate attributeName="r" values={`${director.radius + 4};${director.radius + 14};${director.radius + 4}`} dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle r={director.radius} fill="hsl(230, 25%, 12%)" stroke="hsl(217, 90%, 61%)" strokeWidth={2} />
            <DirectorIcon size={director.radius * 2} />
            <text y={director.radius + 20} textAnchor="middle" fill="hsl(217, 89%, 76%)" fontSize={13} fontWeight={700} className="glow-text">The Director</text>
          </g>
        )}
      </svg>

      <AnimatePresence>
        {selectedNode && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-4 right-4 glass-panel p-4 w-64">
            {selectedNode === "director" ? (
              <>
                <h3 className="text-accent font-bold text-lg">The Director</h3>
                <p className="text-muted-foreground text-sm mt-1">Master orchestrator coordinating all AI agents. Part John Williams precision, part Lebowski groove.</p>
                <div className="mt-3 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Active Agents</span><span className="text-primary">{agentNodes.filter(a => a.status === "active").length}/{agentNodes.length}</span></div>
                  <div className="flex justify-between mt-1"><span>Mode</span><span className="text-primary">Orchestra</span></div>
                </div>
              </>
            ) : (() => {
              const agent = agentNodes.find((a) => a.id === selectedNode);
              if (!agent) return null;
              return (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.color }} />
                    <h3 className="text-foreground font-bold">{agent.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{agent.role}</p>
                  <div className="mt-3 text-xs space-y-1">
                    <div className="flex justify-between text-muted-foreground"><span>Instrument</span><span className="text-accent">{agent.instrument}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Status</span><span style={{ color: STATUS_COLORS[agent.status] }} className="capitalize">{agent.status}</span></div>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NodeGraph;
