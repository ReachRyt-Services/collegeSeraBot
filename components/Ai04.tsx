"use client";

import React, { useRef, useState } from "react";

export default function Ai04({
  onSubmit,
}: {
  onSubmit: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // quick actions that autofill and submit
  const quickActions = [
    { id: "top-colleges", label: "Top colleges in Chennai", prompt: "Top colleges in Chennai for Computer Science" },
    { id: "top-courses", label: "Top courses for AI", prompt: "Top courses for Artificial Intelligence in 2025" },
    { id: "tnea-cutoff", label: "TNEA cutoff for XYZ", prompt: "TNEA cutoff for XYZ college (latest available)" },
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt.trim());
    setPrompt("");
  };

  const handleQuick = (p: string) => {
    setPrompt(p);
    // submit immediately for convenience
    onSubmit(p);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="rounded-xl border border-base-300 p-3 bg-base-200/30">
        <div className="mb-2 text-sm text-primary font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM15.657 14.596a.75.75 0 0 1-1.06 1.06l-1.061-1.06a.75.75 0 0 1 1.06-1.06l1.06 1.06ZM6.464 5.404a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 1.06-1.06l1.06 1.06Z" />
          </svg>
          Ask Collegesera
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="E.g. 'Top colleges in Chennai for Computer Science' or 'TNEA cutoff for XYZ college'"
          className="textarea textarea-bordered w-full resize-none min-h-[60px] bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 text-base-content"
        />

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <button type="submit" className="btn btn-primary btn-sm px-6 text-white bg-primary hover:bg-secondary border-none">
            Ask
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1">
              <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z" />
            </svg>
          </button>

          <input ref={fileInputRef} type="file" className="sr-only" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-ghost btn-sm text-base-content/70">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
            Attach
          </button>

          <div className="ml-auto flex gap-2 overflow-x-auto max-w-full pb-1 scrollbar-hide">
            {quickActions.map(a => (
              <button
                type="button"
                key={a.id}
                onClick={() => handleQuick(a.prompt)}
                className="btn btn-xs btn-outline border-base-300 hover:bg-base-200 hover:text-base-content hover:border-base-300 font-normal whitespace-nowrap"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
