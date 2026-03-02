import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Github, Loader2, ExternalLink, Lock, Unlock, FileText, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { useGenerator } from "@/contexts/GeneratorContext";

interface GitHubExportModalProps {
  open: boolean;
  onClose: () => void;
}

const toggleClass = (active: boolean) =>
  `flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono cursor-pointer transition-all duration-200 ${active
    ? "border-primary/40 bg-primary/10 text-primary"
    : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:border-white/[0.15]"
  }`;

const GitHubExportModal: React.FC<GitHubExportModalProps> = ({ open, onClose }) => {
  const { generatedFiles, researchReport } = useGenerator();
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [includeReadme, setIncludeReadme] = useState(true);
  const [includeGitignore, setIncludeGitignore] = useState(true);
  const [excludedFiles, setExcludedFiles] = useState<Set<string>>(new Set());
  const [pushing, setPushing] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");

  const toggleFile = (filename: string) => {
    setExcludedFiles((prev) => {
      const next = new Set(prev);
      next.has(filename) ? next.delete(filename) : next.add(filename);
      return next;
    });
  };

  const handlePush = async () => {
    if (!repoName.trim()) return;
    setPushing(true);

    try {
      // Build file list from generated files + research report
      const files = generatedFiles
        .filter((f) => !excludedFiles.has(f.filename))
        .map((f) => ({ filename: f.filename, content: f.content }));

      if (researchReport && !excludedFiles.has("RESEARCH_REPORT.md")) {
        files.push({ filename: "RESEARCH_REPORT.md", content: researchReport });
      }

      const res = await fetch("/api/github-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoName,
          files,
          description,
          isPrivate,
          includeReadme,
          includeGitignore,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "GitHub push failed");
      }

      setRepoUrl(data.repoUrl || "");
      toast.success(`Repository created! ${data.committedFiles?.length || 0} files pushed.`);
    } catch (err) {
      toast.error("GitHub push failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setPushing(false);
    }
  };

  const allFiles = [
    ...generatedFiles.map((f) => f.filename),
    ...(researchReport ? ["RESEARCH_REPORT.md"] : []),
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-card border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 turbo-gradient-text">
            <Github className="w-5 h-5" /> Export to GitHub
          </DialogTitle>
        </DialogHeader>

        {repoUrl ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-sm text-emerald-400">Repository created!</p>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
            >
              <ExternalLink className="w-4 h-4" /> Open on GitHub
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Repository Name</label>
              <Input
                className="bg-[#0A0A0A] border-transparent font-mono text-xs"
                placeholder="my-architecture"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <Textarea
                className="bg-[#0A0A0A] border-transparent font-mono text-xs min-h-[60px]"
                placeholder="Generated architecture documents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Toggles */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Options</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={toggleClass(true)}
                >
                  {isPrivate ? (
                    <><Lock className="w-3.5 h-3.5" /> Private</>
                  ) : (
                    <><Unlock className="w-3.5 h-3.5" /> Public</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeReadme(!includeReadme)}
                  className={toggleClass(includeReadme)}
                >
                  <FileText className="w-3.5 h-3.5" /> README.md
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeGitignore(!includeGitignore)}
                  className={toggleClass(includeGitignore)}
                >
                  <GitBranch className="w-3.5 h-3.5" /> .gitignore
                </button>
              </div>
            </div>

            {/* Files */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">
                Files ({allFiles.length - excludedFiles.size} selected)
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {allFiles.map((filename) => (
                  <label
                    key={filename}
                    className="flex items-center gap-2 text-xs text-foreground/70 cursor-pointer hover:text-foreground transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!excludedFiles.has(filename)}
                      onChange={() => toggleFile(filename)}
                      className="rounded border-white/20"
                    />
                    <span className="font-mono">{filename}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handlePush}
              disabled={pushing || !repoName.trim()}
              className="w-full turbo-gradient-bg text-white border-0"
            >
              {pushing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Github className="w-4 h-4 mr-2" />
              )}
              Push to GitHub
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GitHubExportModal;
