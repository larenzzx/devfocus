import React, { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function DeveloperLogWidget() {
  const [note, setNote] = useState(() => {
    return localStorage.getItem("devfocus_note") || "// Quick notepad for scratch code & thoughts\n// Saved automatically...\n\nfunction initFocus() {\n  console.log('Stay focused, build things.');\n}";
  });

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    localStorage.setItem("devfocus_note", e.target.value);
  };

  return (
    <Card className="bg-slate-900/45 backdrop-blur-md border border-white/8 rounded-2xl shadow-xl flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="size-4 text-primary" /> Developer Log
        </CardTitle>
        <CardDescription>Persistent scratchpad & snippets</CardDescription>
      </CardHeader>

      <CardContent className="py-2 flex-1">
        <textarea
          value={note}
          onChange={handleNoteChange}
          className="w-full h-32 bg-slate-950/50 border border-white/8 rounded-xl p-3 text-xs font-mono text-slate-300 placeholder:text-slate-600 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          spellCheck="false"
        />
      </CardContent>
    </Card>
  );
}
