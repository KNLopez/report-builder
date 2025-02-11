import { fabric } from "fabric";
import { useEffect, useState } from "react";

interface ImageControlsProps {
  canvas: fabric.Canvas | null;
}

export default function ImageControls({ canvas }: ImageControlsProps) {
  const [activeObject, setActiveObject] = useState<fabric.Image | null>(null);

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = () => {
      const selected = canvas.getActiveObject();
      setActiveObject(selected instanceof fabric.Image ? selected : null);
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setActiveObject(null));

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", () => setActiveObject(null));
    };
  }, [canvas]);

  if (!activeObject) return null;

  const handleDelete = () => {
    if (activeObject && canvas) {
      canvas.remove(activeObject);
      canvas.renderAll();
      setActiveObject(null);
    }
  };

  const handleRotate = (angle: number) => {
    if (activeObject) {
      activeObject.rotate((activeObject.angle || 0) + angle);
      canvas?.renderAll();
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex gap-2">
      <button
        onClick={() => handleRotate(-90)}
        className="p-2 hover:bg-gray-100 rounded"
        title="Rotate Left"
      >
        ↺
      </button>
      <button
        onClick={() => handleRotate(90)}
        className="p-2 hover:bg-gray-100 rounded"
        title="Rotate Right"
      >
        ↻
      </button>
      <button
        onClick={handleDelete}
        className="p-2 hover:bg-red-100 text-red-600 rounded"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}
