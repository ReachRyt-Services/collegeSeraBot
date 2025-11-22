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
      <form onSubmit={handleSubmit} className="rounded-xl border p-3 bg-gradient-to-b from-[#fff9f4] to-[#fffaf6]">
        <div className="mb-2 text-sm text-car-primary font-semibold">Ask Collegesera</div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g. 'Top colleges in Chennai for Computer Science' or 'TNEA cutoff for XYZ college'"
          className="w-full p-2 rounded border resize-none min-h-[64px]"
        />

        <div className="mt-2 flex items-center gap-2">
          <button type="submit" className="btn btn-primary">
            Ask
          </button>

          <input ref={fileInputRef} type="file" className="sr-only" />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-ghost">
            Attach
          </button>

          <div className="ml-auto flex gap-2">
            {quickActions.map(a => (
              <button type="button" key={a.id} onClick={() => handleQuick(a.prompt)} className="btn btn-sm btn-outline">
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
