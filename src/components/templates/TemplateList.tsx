import { Button } from "../ui/button";

interface TemplateListProps {
  onSelect: (template: string) => void;
}

export default function TemplateList({ onSelect }: TemplateListProps) {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-medium">Templates</h2>
      <div className="mt-2 space-y-2">
        <Button onClick={() => onSelect("blank")}>Blank Template</Button>
      </div>
    </div>
  );
}
