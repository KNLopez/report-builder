import { Spot, useReportStore } from "@/lib/store/reportStore";
import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";
import init from "../../../wasm/pkg/report_builder_wasm";
import ImageControls from "./ImageControls";
import ImageUploader from "./ImageUploader";
import TableControls from "./TableControls";

interface CanvasEditorProps {
  canvas: fabric.Canvas | null;
}

// Define the table structure
interface TableColumn {
  key: string;
  label: string;
  visible: boolean;
  width: number;
  getValue: (spot: Spot) => string;
}

const defaultColumns: TableColumn[] = [
  {
    key: "images",
    label: "Images",
    visible: true,
    width: 120,
    getValue: (spot) => "", // Empty string as we'll render images separately
  },
  {
    key: "name",
    label: "Location",
    visible: true,
    width: 150,
    getValue: (spot) => spot.name,
  },
  {
    key: "status",
    label: "Status",
    visible: true,
    width: 100,
    getValue: (spot) => spot.status,
  },
  {
    key: "type",
    label: "Type",
    visible: true,
    width: 100,
    getValue: (spot) => spot.metadata.type,
  },
  {
    key: "deviceId",
    label: "Device ID",
    visible: true,
    width: 120,
    getValue: (spot) => spot.metadata.deviceId,
  },
  {
    key: "temperature",
    label: "Temperature",
    visible: true,
    width: 100,
    getValue: (spot) => `${spot.measurements.temperature}°C`,
  },
];

interface PageConfig {
  width: number;
  height: number;
  margin: number;
  rowsPerPage: number;
}

const PAGE_CONFIG: PageConfig = {
  width: 800,
  height: 1000,
  margin: 50,
  rowsPerPage: 10,
};

export default function CanvasEditor({ canvas }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useReportStore((state) => state.images);
  const spots = useReportStore((state) => state.spots);
  const [columns, setColumns] = useState(defaultColumns);
  const [wasmModule, setWasmModule] = useState<
    typeof import("../../../wasm/pkg/report_builder_wasm") | null
  >(null);
  const [loadedPages, setLoadedPages] = useState<number>(0);
  const BATCH_SIZE = 5; // Number of pages to load at once

  useEffect(() => {
    if (canvas && images.length > 0) {
      // Load the most recently added image
      const lastImage = images[images.length - 1];
      fabric.Image.fromURL(lastImage, (img) => {
        // Scale image to reasonable size if needed
        if (img.width && img.width > 300) {
          img.scaleToWidth(300, false);
        }

        // Position new images with slight offset
        const offset = (images.length - 1) * 20;
        img.set({
          left: offset,
          top: offset,
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    }
  }, [canvas, images]);

  // Initialize WASM
  useEffect(() => {
    async function initWasm() {
      try {
        const wasm = await init();
        const module = await import("../../../wasm/pkg/report_builder_wasm");
        setWasmModule(module);
      } catch (error) {
        console.error("Failed to initialize WASM:", error);
      }
    }
    initWasm();
  }, []);

  const createTablePage = (
    spots: Spot[],
    columns: TableColumn[],
    pageIndex: number,
    pageY: number
  ) => {
    const visibleColumns = columns.filter((col) => col.visible);
    const cellHeight = 80;
    const startIndex = pageIndex * PAGE_CONFIG.rowsPerPage;
    const pageSpots = spots.slice(
      startIndex,
      startIndex + PAGE_CONFIG.rowsPerPage
    );

    // Create page background
    const page = new fabric.Rect({
      left: PAGE_CONFIG.margin,
      top: pageY,
      width: PAGE_CONFIG.width - PAGE_CONFIG.margin * 2,
      height: PAGE_CONFIG.height,
      fill: "#ffffff",
      stroke: "#e5e7eb",
      selectable: false,
      evented: false,
      shadow: new fabric.Shadow({
        color: "rgba(0,0,0,0.2)",
        blur: 10,
        offsetX: 5,
        offsetY: 5,
      }),
    });

    const tableObjects: fabric.Object[] = [page];
    let imagePromises: Promise<fabric.Image>[] = [];

    // Create cells and text
    visibleColumns.forEach((col, colIndex) => {
      const x =
        page.left! +
        visibleColumns.slice(0, colIndex).reduce((sum, c) => sum + c.width, 0);

      // Header cell background
      const headerCell = new fabric.Rect({
        left: x,
        top: page.top,
        width: col.width,
        height: cellHeight,
        fill: "#f3f4f6",
        stroke: "#e5e7eb",
        selectable: false,
        evented: false,
      });

      // Header text with improved editing
      const headerText = new fabric.IText(col.label, {
        left: x + 8,
        top: page.top! + cellHeight / 3,
        fontSize: 12,
        fontFamily: "Arial",
        width: col.width - 16,
        selectable: true,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        hoverCursor: "text",
      });

      tableObjects.push(headerCell, headerText);

      // Create rows
      pageSpots.forEach((spot, rowIndex) => {
        const y = page.top! + (rowIndex + 1) * cellHeight;

        // Cell background
        const cell = new fabric.Rect({
          left: x,
          top: y,
          width: col.width,
          height: cellHeight,
          fill: "#ffffff",
          stroke: "#e5e7eb",
          selectable: false,
          evented: false,
        });

        tableObjects.push(cell);

        if (col.key === "images" && spot.images?.length > 0) {
          spot.images.slice(0, 2).forEach((img, imgIndex) => {
            const promise = new Promise<fabric.Image>((resolve) => {
              fabric.Image.fromURL(
                img.url,
                (fabricImg) => {
                  const thumbnailSize = 60;
                  const scale =
                    thumbnailSize /
                    Math.max(fabricImg.width || 1, fabricImg.height || 1);

                  fabricImg.scale(scale);
                  fabricImg.set({
                    left: x + 8 + imgIndex * (thumbnailSize + 4),
                    top: y + 10,
                    selectable: true,
                    hasControls: true,
                  });
                  resolve(fabricImg);
                },
                { crossOrigin: "anonymous" }
              );
            });
            imagePromises.push(promise);
          });

          if (spot.images.length > 2) {
            const moreText = new fabric.Text(`+${spot.images.length - 2}`, {
              left: x + 8 + 2 * 64,
              top: y + 30,
              fontSize: 12,
              fontFamily: "Arial",
              selectable: false,
            });
            tableObjects.push(moreText);
          }
        } else {
          // Cell text with improved editing
          const cellText = new fabric.IText(col.getValue(spot), {
            left: x + 8,
            top: y + (cellHeight - 20) / 2,
            fontSize: 12,
            fontFamily: "Arial",
            width: col.width - 16,
            selectable: true,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            hoverCursor: "text",
          });

          tableObjects.push(cellText);
        }
      });
    });

    // Add page number
    const pageNum = new fabric.Text(`Page ${pageIndex + 1}`, {
      left: page.left! + page.width! / 2,
      top: page.top! + page.height! - 30,
      fontSize: 12,
      fontFamily: "Arial",
      originX: "center",
    });
    tableObjects.push(pageNum);

    return Promise.all(imagePromises).then((images) => {
      tableObjects.push(...images);
      return tableObjects;
    });
  };

  const createPaginatedTable = async (
    spots: Spot[],
    columns: TableColumn[]
  ) => {
    if (!wasmModule) {
      console.warn("WASM module not initialized");
      return [];
    }

    try {
      // Log the module to see what's available
      console.log("WASM Module:", wasmModule);

      const calculator = new wasmModule.TableCalculator(
        PAGE_CONFIG.height,
        PAGE_CONFIG.rowsPerPage,
        80,
        PAGE_CONFIG.margin
      );

      // Convert the data for WASM
      const spotsData = spots.map((spot) => ({
        id: spot.id,
        name: spot.name,
        status: spot.status,
        metadata: spot.metadata,
        measurements: spot.measurements,
        images: spot.images,
      }));

      const columnsData = columns.map((col) => ({
        key: col.key,
        label: col.label,
        visible: col.visible,
        width: col.width,
      }));

      const pages = calculator.calculate_pages(spotsData, columnsData);

      // The result should already be an object, no need to parse
      return createFabricObjectsFromPages(pages);
    } catch (error) {
      console.error("Failed to calculate pages:", error);
      return [];
    }
  };

  const createFabricObjectsFromPages = async (pages: any[]) => {
    const allObjects: fabric.Object[] = [];
    const imagePromises: Promise<fabric.Object[]>[] = [];

    pages.forEach((page) => {
      // Create page background
      const pageRect = new fabric.Rect({
        left: PAGE_CONFIG.margin,
        top: page.y_offset,
        width: PAGE_CONFIG.width - PAGE_CONFIG.margin * 2,
        height: PAGE_CONFIG.height,
        fill: "#ffffff",
        stroke: "#e5e7eb",
        selectable: false,
        evented: false,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.2)",
          blur: 10,
          offsetX: 5,
          offsetY: 5,
        }),
      });
      allObjects.push(pageRect);

      // Create cells from WASM-calculated positions
      page.cells.forEach((cell: any) => {
        const cellRect = new fabric.Rect({
          left: cell.x,
          top: cell.y,
          width: cell.width,
          height: cell.height,
          fill: "#ffffff",
          stroke: "#e5e7eb",
          selectable: false,
          evented: false,
        });
        allObjects.push(cellRect);

        if (cell.images) {
          // Handle images
          cell.images.forEach((imgData: any) => {
            const promise = new Promise<fabric.Object>((resolve) => {
              fabric.Image.fromURL(
                imgData.url,
                (img) => {
                  img.set({
                    left: imgData.x,
                    top: imgData.y,
                    scaleX: imgData.width / (img.width || 1),
                    scaleY: imgData.height / (img.height || 1),
                    selectable: true,
                    hasControls: true,
                  });
                  resolve(img);
                },
                { crossOrigin: "anonymous" }
              );
            });
            imagePromises.push(promise);
          });
        } else {
          const cellText = new fabric.IText(cell.content, {
            left: cell.x + 8,
            top: cell.y + (cell.height - 20) / 2,
            fontSize: 12,
            fontFamily: "Arial",
            width: cell.width - 16,
            selectable: true,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            hoverCursor: "text",
          });
          allObjects.push(cellText);
        }
      });

      // Add page number
      const pageNum = new fabric.Text(`Page ${page.page_number}`, {
        left: pageRect.left! + pageRect.width! / 2,
        top: pageRect.top! + pageRect.height! - 30,
        fontSize: 12,
        fontFamily: "Arial",
        originX: "center",
      });
      allObjects.push(pageNum);
    });

    // Wait for all images to load
    const loadedImages = await Promise.all(imagePromises);
    allObjects.push(...loadedImages.flat());

    return allObjects;
  };

  useEffect(() => {
    if (canvas && spots.length > 0) {
      let tableObjects: fabric.Object[] = [];
      const totalPages = Math.ceil(spots.length / PAGE_CONFIG.rowsPerPage);

      const loadBatch = async (startPage: number) => {
        const endPage = Math.min(startPage + BATCH_SIZE, totalPages);
        const batchSpots = spots.slice(
          startPage * PAGE_CONFIG.rowsPerPage,
          endPage * PAGE_CONFIG.rowsPerPage
        );

        if (!wasmModule) return;

        try {
          const calculator = new wasmModule.TableCalculator(
            PAGE_CONFIG.height,
            PAGE_CONFIG.rowsPerPage,
            80,
            PAGE_CONFIG.margin
          );

          const spotsData = batchSpots.map((spot) => ({
            id: spot.id,
            name: spot.name,
            status: spot.status,
            metadata: spot.metadata,
            measurements: spot.measurements,
            images: spot.images,
          }));

          const pages = calculator.calculate_pages(spotsData, columns);
          const objects = await createFabricObjectsFromPages(pages);

          canvas.add(...objects);
          tableObjects.push(...objects);
          setLoadedPages(endPage);

          // Load next batch if available
          if (endPage < totalPages) {
            requestAnimationFrame(() => loadBatch(endPage));
          }

          canvas.renderAll();

          // Update canvas height for current batch
          const totalHeight = Math.max(
            endPage * (PAGE_CONFIG.height + 20) + PAGE_CONFIG.margin * 2,
            canvas.height || 0
          );
          canvas.setDimensions({
            width: PAGE_CONFIG.width,
            height: totalHeight,
          });
        } catch (error) {
          console.error("Failed to load batch:", error);
        }
      };

      // Start loading first batch
      loadBatch(0);

      return () => {
        tableObjects.forEach((obj) => canvas.remove(obj));
        canvas.off("mouse:down");
        canvas.off("selection:cleared");
      };
    }
  }, [canvas, spots, columns]);

  // Add loading indicator
  const loadingProgress =
    loadedPages > 0
      ? Math.round(
          (loadedPages / Math.ceil(spots.length / PAGE_CONFIG.rowsPerPage)) *
            100
        )
      : 0;

  return (
    <div className="space-y-4">
      <ImageUploader />
      <div className="border rounded-lg p-1 bg-white relative">
        <canvas ref={canvasRef} id="report-canvas" />
        {loadingProgress < 100 && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-2">Loading table...</div>
              <div className="text-sm text-gray-500">{loadingProgress}%</div>
            </div>
          </div>
        )}
        <ImageControls canvas={canvas} />
        <TableControls
          canvas={canvas}
          columns={columns}
          onColumnChange={setColumns}
        />
      </div>
    </div>
  );
}
