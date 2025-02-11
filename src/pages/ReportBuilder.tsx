import { fabric } from "fabric";
import { useEffect, useState } from "react";
import CanvasEditor from "../components/canvas/CanvasEditor";
import DataImporter from "../components/data/DataImporter";
import TemplateList from "../components/templates/TemplateList";

interface Spot {
  id: string;
  severity: string;
  location: string;
  createdBy: string;
  createdDate: Date;
  defectType: string;
  // Add more properties as needed
}

export default function ReportBuilder() {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas("report-canvas", {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    });
    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  return (
    <div className="flex gap-4">
      <div className="w-80 flex-shrink-0 space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-4">Import Data</h2>
          <DataImporter />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <TemplateList onSelect={() => {}} />
        </div>
      </div>

      <div className="flex-1">
        <CanvasEditor canvas={canvas} />
      </div>
    </div>
  );
}
