import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import botIcon from "@/assets/bot-icon.png";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "How do I get started?",
  "Show me my templates",
  "How do I connect Snov.io?",
  "What variables can I use?",
  "How do I add contacts?",
  "What can you help me with?",
];

const AIChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offTopicCount, setOffTopicCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const resetChat = () => {
    setMessages([]);
    setOffTopicCount(0);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Send last 6 messages + off_topic_count for guardrails
      const apiMessages = updatedMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("deepseek-chat", {
        body: { messages: apiMessages, off_topic_count: offTopicCount },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Track off-topic count from backend
      if (data?.off_topic_count !== undefined) {
        setOffTopicCount(data.off_topic_count);
      }

      const reply = data?.reply || "Sorry, I couldn't generate a response.";
      const tier = data?.tier;

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Log tier for debugging (remove later)
      if (tier !== undefined) {
        console.log(`[AI] Tier ${tier} response${tier === 0 ? ' (cached/blocked)' : ''}`);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, something went wrong: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const isBullet = /^[\-\*•]\s/.test(line.trim());
      const isNumbered = /^\d+[\)\.]\s/.test(line.trim());
      const bulletContent = isBullet ? line.trim().replace(/^[\-\*•]\s/, "") : isNumbered ? line.trim() : line;

      const parts = bulletContent.split(/(\*\*[^*]+\*\*|`[^`]+`|\{\{[^}]+\}\})/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={j} className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith("{{") && part.endsWith("}}")) {
          return <code key={j} className="bg-primary/10 text-primary px-1 py-0.5 rounded text-xs font-mono">{part}</code>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={i} className="flex gap-1.5 ml-1">
            <span className="text-primary shrink-0">•</span>
            <span>{rendered}</span>
          </div>
        );
      }

      return (
        <span key={i}>
          {rendered}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-105 overflow-hidden bg-card border-2 border-primary/30"
          aria-label="Open AI assistant"
        >
          <img src={botIcon} alt="AI Assistant" className="w-full h-full object-cover" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] h-[100dvh] sm:h-[560px] bg-card border border-border sm:rounded-2xl rounded-none shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <img src={botIcon} alt="" className="w-7 h-7 rounded-full" />
              <div>
                <span className="font-semibold text-sm">AI Assistant</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={resetChat} title="New chat">
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  👋 Hi! I can help you manage templates, campaigns, personalized pages, and Snov.io. I can actually do things for you — not just answer questions. Try:
                </p>
                <div className="space-y-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "text-sm leading-relaxed max-w-[90%] px-3 py-2 rounded-xl",
                  msg.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Working on it…
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2 pb-safe">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="text-sm"
              disabled={loading}
            />
            <Button type="submit" size="sm" className="shrink-0" disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
