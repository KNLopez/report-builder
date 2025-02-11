import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

interface Column {
  key: string;
  label: string;
  visible: boolean;
  width: number;
}

interface TableControlsProps {
  canvas: fabric.Canvas | null;
  columns: Column[];
  onColumnChange: (columns: Column[]) => void;
}

export default function TableControls({
  canvas,
  columns,
  onColumnChange,
}: TableControlsProps) {
  const activeObject = canvas?.getActiveObject();
  const isTable = activeObject?.type === "table";
  const [showColumnManager, setShowColumnManager] = useState(false);

  if (!isTable) return null;

  const handleColumnToggle = (columnKey: string) => {
    const updatedColumns = columns.map((col) =>
      col.key === columnKey ? { ...col, visible: !col.visible } : col
    );
    onColumnChange(updatedColumns);
  };

  const handleTextAlign = (align: "left" | "center" | "right") => {
    const activeCell = canvas?.getActiveObject();
    if (activeCell instanceof fabric.Textbox) {
      activeCell.set("textAlign", align);
      canvas?.renderAll();
    }
  };

  const handleDoubleClick = (e: fabric.IEvent) => {
    const target = e.target;
    if (target instanceof fabric.Image) {
      // Show full-size image preview
      const fullImage = new fabric.Image(target.getElement(), {
        left: canvas!.width! / 2,
        top: canvas!.height! / 2,
        originX: "center",
        originY: "center",
        scaleX: 1,
        scaleY: 1,
      });

      canvas?.add(fullImage);
      canvas?.setActiveObject(fullImage);
      canvas?.renderAll();
    }
  };

  useEffect(() => {
    if (canvas) {
      canvas.on("mouse:dblclick", handleDoubleClick);
      return () => {
        canvas.off("mouse:dblclick", handleDoubleClick);
      };
    }
  }, [canvas]);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-2">
      <div className="flex gap-2 items-center">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowColumnManager(!showColumnManager)}
        >
          Manage Columns
        </Button>

        <div className="border-l pl-2 flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTextAlign("left")}
          >
            ←
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTextAlign("center")}
          >
            ↔
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTextAlign("right")}
          >
            →
          </Button>
        </div>
      </div>

      {showColumnManager && (
        <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 min-w-[200px]">
          <h3 className="font-medium mb-2">Toggle Columns</h3>
          <div className="space-y-2">
            {columns.map((column) => (
              <div key={column.key} className="flex items-center gap-2">
                <Checkbox
                  id={column.key}
                  checked={column.visible}
                  onCheckedChange={() => handleColumnToggle(column.key)}
                />
                <label htmlFor={column.key} className="text-sm">
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
