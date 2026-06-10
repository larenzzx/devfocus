import { useState } from "react";
import { Quote, RefreshCw } from "lucide-react";

const QUOTES = [
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" }
];

export function QuoteFooter() {
  const [quote, setQuote] = useState(QUOTES[0]);

  const changeQuote = () => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  };

  return (
    <footer className="max-w-6xl w-full mx-auto mt-6 p-4 bg-slate-900/30 backdrop-blur-md border border-white/5 rounded-2xl shadow-lg flex items-center justify-between text-xs gap-4">
      <div className="flex items-center gap-2 text-slate-300">
        <Quote className="size-3.5 text-primary shrink-0" />
        <span className="italic font-mono">"{quote.text}"</span>
        <span className="text-slate-500">— {quote.author}</span>
      </div>
      <button 
        onClick={changeQuote} 
        className="cursor-pointer text-slate-400 hover:text-white transition-colors bg-slate-950/50 hover:bg-slate-850 px-2 py-1 rounded border border-white/5 flex items-center gap-1 font-mono text-[10px]"
      >
        <RefreshCw className="size-3" /> Next
      </button>
    </footer>
  );
}
