import { useState, useRef, useEffect } from "react";
import { Check, X, Bold, Italic, Type, Palette, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  fieldName: string;
  className?: string;
  placeholder?: string;
  supportsPersonalization?: boolean;
}

const PERSONALIZATION_TOKENS = [
  { token: "{{first_name}}", label: "First Name" },
  { token: "{{last_name}}", label: "Last Name" },
  { token: "{{company}}", label: "Company" },
  { token: "{{full_name}}", label: "Full Name" },
];

const FONT_SIZES = [
  { value: "text-sm", label: "Small" },
  { value: "text-base", label: "Normal" },
  { value: "text-lg", label: "Large" },
  { value: "text-xl", label: "X-Large" },
  { value: "text-2xl", label: "2X-Large" },
];

const TEXT_COLORS = [
  { value: "text-foreground", label: "Default", color: "hsl(var(--foreground))" },
  { value: "text-primary", label: "Primary", color: "hsl(var(--primary))" },
  { value: "text-muted-foreground", label: "Muted", color: "hsl(var(--muted-foreground))" },
  { value: "text-destructive", label: "Red", color: "hsl(var(--destructive))" },
];

const RichTextEditor = ({
  value,
  onChange,
  fieldName,
  className,
  placeholder = "Click to edit...",
  supportsPersonalization = false,
}: RichTextEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
    // Ctrl/Cmd + Enter to save
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = editValue.substring(0, start) + text + editValue.substring(end);
      setEditValue(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editValue.substring(start, end);
      const newValue = editValue.substring(0, start) + before + selectedText + after + editValue.substring(end);
      setEditValue(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  // Render formatted content for display with proper paragraph spacing
  const renderFormattedContent = () => {
    if (!value) return <span className="text-muted-foreground italic">{placeholder}</span>;
    
    // Split by double newlines for paragraphs
    const paragraphs = value.split('\n\n');
    
    return paragraphs.map((paragraph, paraIndex) => {
      // Check for formatting markers
      const isBoldParagraph = paragraph.startsWith('**') && paragraph.endsWith('**');
      const isItalicParagraph = paragraph.startsWith('*') && paragraph.endsWith('*') && !isBoldParagraph;
      
      if (isBoldParagraph) {
        const text = paragraph.slice(2, -2);
        return (
          <p key={paraIndex} className="text-foreground font-semibold">
            {text.split('\n').map((line, i) => (
              <span key={i}>{renderLineWithTokens(line)}{i < text.split('\n').length - 1 && <br />}</span>
            ))}
          </p>
        );
      }
      
      if (isItalicParagraph) {
        const text = paragraph.slice(1, -1);
        return (
          <p key={paraIndex} className="text-foreground font-medium">
            <span className="text-primary">{text}</span>
          </p>
        );
      }
      
      // Regular paragraph - handle inline bold/italic
      return (
        <p key={paraIndex}>
          {paragraph.split('\n').map((line, i) => (
            <span key={i}>{renderLineWithTokens(line)}{i < paragraph.split('\n').length - 1 && <br />}</span>
          ))}
        </p>
      );
    });
  };

  // Helper to render tokens within a line
  const renderLineWithTokens = (line: string): React.ReactNode => {
    const tokenRegex = /({{[^}]+}})/g;
    const parts = line.split(tokenRegex);
    
    return parts.map((part, index) => {
      if (part.match(/{{[^}]+}}/)) {
        return (
          <span 
            key={index} 
            className="bg-primary/20 text-primary px-1 rounded font-mono text-[0.85em]"
          >
            {part}
          </span>
        );
      }
      
      // Handle inline **bold**
      if (part.includes('**')) {
        const boldRegex = /\*\*(.+?)\*\*/g;
        const segments = part.split(boldRegex);
        return segments.map((segment, segIndex) => {
          if (segIndex % 2 === 1) {
            return <strong key={segIndex} className="font-semibold text-foreground">{segment}</strong>;
          }
          return segment;
        });
      }
      
      return part;
    });
  };

  if (isEditing) {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute -inset-2 bg-primary/10 rounded-lg border-2 border-primary border-dashed z-10" />
        <div className="relative z-20 bg-white rounded-lg shadow-lg p-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => wrapSelection('**', '**')}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => wrapSelection('*', '*')}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            
            <div className="w-px h-6 bg-border mx-1" />
            
            {supportsPersonalization && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Type className="w-4 h-4 mr-1" />
                    Insert Variable
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <div className="space-y-1">
                    {PERSONALIZATION_TOKENS.map((item) => (
                      <Button
                        key={item.token}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-7"
                        onClick={() => insertAtCursor(item.token)}
                      >
                        <code className="text-primary mr-2">{item.token}</code>
                        <span className="text-muted-foreground">{item.label}</span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="w-full min-h-[200px] p-3 text-base border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={placeholder}
          />
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground">
              Editing: {fieldName} | <kbd className="bg-muted px-1 rounded">Ctrl+Enter</kbd> to save
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all",
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      {/* Edit indicator */}
      <div className="absolute -inset-2 bg-primary/0 group-hover:bg-primary/5 rounded-lg border border-transparent group-hover:border-primary/30 group-hover:border-dashed transition-all" />
      
      {/* Edit button */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
          <AlignLeft className="w-3 h-3" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative">
        {renderFormattedContent()}
      </div>
    </div>
  );
};

export default RichTextEditor;
