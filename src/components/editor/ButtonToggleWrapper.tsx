import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface ButtonToggleWrapperProps {
  configKey: string;
  visible: boolean;
  onToggle: (key: string, visible: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a button in the template editor with a small toggle switch.
 * When toggled off, the button appears faded; on live pages it's completely hidden.
 */
const ButtonToggleWrapper = ({
  configKey,
  visible,
  onToggle,
  children,
  className,
}: ButtonToggleWrapperProps) => {
  return (
    <div className={cn("relative group/btn inline-flex items-center gap-2", className)}>
      <div
        className={cn(
          "transition-opacity",
          !visible && "opacity-30 line-through decoration-2"
        )}
      >
        {children}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Switch
          checked={visible}
          onCheckedChange={(checked) => onToggle(configKey, checked)}
          className="scale-75"
        />
      </div>
    </div>
  );
};

export default ButtonToggleWrapper;
