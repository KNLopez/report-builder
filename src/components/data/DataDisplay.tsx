import { useReportStore } from "@/lib/store/reportStore";
import { Button } from "../ui/button";
import CustomLayout from "./CustomLayout";
import DataTable from "./DataTable";

export default function DataDisplay() {
  const { spots, displayMode, setDisplayMode } = useReportStore((state) => ({
    spots: state.spots,
    displayMode: state.displayMode,
    setDisplayMode: state.setDisplayMode,
  }));

  if (spots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={displayMode === "table" ? "default" : "outline"}
          onClick={() => setDisplayMode("table")}
        >
          Table View
        </Button>
        <Button
          variant={displayMode === "custom" ? "default" : "outline"}
          onClick={() => setDisplayMode("custom")}
        >
          Custom Layout
        </Button>
        <Button
          variant={displayMode === "template" ? "default" : "outline"}
          onClick={() => setDisplayMode("template")}
        >
          Template View
        </Button>
      </div>

      {displayMode === "table" && <DataTable spots={spots} />}
      {displayMode === "custom" && <CustomLayout spots={spots} />}
      {/* {displayMode === "template" && <TemplateView spots={spots} />} */}
    </div>
  );
}
