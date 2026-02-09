import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Braces } from "lucide-react";

const VARIABLES = [
  { token: "{{first_name}}", label: "First Name" },
  { token: "{{last_name}}", label: "Last Name" },
  { token: "{{company}}", label: "Company" },
  { token: "{{full_name}}", label: "Full Name" },
  { token: "{{landing_page}}", label: "Landing Page URL" },
  { token: "{{custom_field}}", label: "Custom Field" },
];

interface VariableInsertProps {
  onInsert: (token: string) => void;
}

const VariableInsert = ({ onInsert }: VariableInsertProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-7 px-1.5 text-muted-foreground" title="Insert variable">
        <Braces className="w-3.5 h-3.5" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuLabel className="text-xs">Insert Variable</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {VARIABLES.map((v) => (
        <DropdownMenuItem key={v.token} onClick={() => onInsert(v.token)} className="text-xs">
          <code className="text-primary mr-2 font-mono">{v.token}</code>
          <span className="text-muted-foreground">{v.label}</span>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);

export default VariableInsert;
