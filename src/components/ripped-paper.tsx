"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Pencil, Type, Download, RotateCcw } from "lucide-react";
import html2canvas from "@jsplumb/html2canvas";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/get-media-query";

interface RippedPaperProps {
  content: string;
  onContentChange: (value: string) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Path {
  points: Point[];
  id: string;
}

const UNDERLINE_PATH = `
  M 40 10 
  C 10 10, 0 5, 0 10
  S 180 10, 230 8
  S 280 6, 330 10
  S 380 10, 400 10
  S 380 5, 330 12
  S 280 12, 230 8
  S 180 5, 130 12

`;

export default function RippedPaper({
  content,
  onContentChange,
}: RippedPaperProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [rotation, setRotation] = useState(0);
  const mediaQuery = useMediaQuery();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRotation(Math.random() * 10 - 5);
  }, []);

  const startDrawing = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDrawMode) return;
      const svg = svgRef.current;
      if (!svg) return;

      svg.setPointerCapture(e.pointerId);

      const point = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };

      setIsDrawing(true);
      setCurrentPath([point]);
    },
    [isDrawMode]
  );

  const draw = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDrawing || !isDrawMode) return;

      const point = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };

      setCurrentPath((prev) => [...prev, point]);
    },
    [isDrawing, isDrawMode]
  );

  const stopDrawing = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (currentPath.length > 0) {
        setPaths((prev) => [
          ...prev,
          { points: currentPath, id: Math.random().toString() },
        ]);
        setCurrentPath([]);
      }
      setIsDrawing(false);

      const svg = svgRef.current;
      if (svg) {
        svg.releasePointerCapture(e.pointerId);
      }
    },
    [currentPath]
  );

  const handleReset = useCallback(() => {
    setPaths([]);
    onContentChange("");
    setRotation(Math.random() * 15 - 7.5);
  }, [onContentChange]);

  const pointsToPath = (points: Point[]) => {
    if (points.length === 0) return "";

    // Start at the first point
    const pathData = [`M ${points[0].x} ${points[0].y}`];

    // Add line segments to each subsequent point
    for (let i = 1; i < points.length; i++) {
      pathData.push(`L ${points[i].x} ${points[i].y}`);
    }

    return pathData.join(" ");
  };

  const handleDownload = async () => {
    if (wrapperRef.current) {
      // Hide buttons temporarily
      const buttonsDiv = document.querySelector(
        ".control-buttons"
      ) as HTMLElement;
      if (buttonsDiv) {
        buttonsDiv.style.display = "none";
      }

      // Calculate dimensions while maintaining aspect ratio
      const maxWidth = 1920;
      const maxHeight = 1080;
      const scale = Math.min(
        maxWidth / wrapperRef.current.offsetWidth,
        maxHeight / wrapperRef.current.offsetHeight
      );

      const canvas = await html2canvas(wrapperRef.current, {
        backgroundColor: "#000000",
        scale: scale,
        width: Math.min(wrapperRef.current.offsetWidth, maxWidth),
        height: Math.min(wrapperRef.current.offsetHeight, maxHeight),
        logging: false,
        imageTimeout: 0,
        useCORS: true,
        onclone: (clonedDoc) => {
          const textarea = clonedDoc.querySelector("textarea");
          if (textarea) {
            const div = clonedDoc.createElement("div");
            div.innerHTML = textarea.value
              .split("\n")
              .map((line) => line || "&nbsp;")
              .join("<br>");

            div.style.cssText = `
              width: 100%;
              height: 100%;
              background: transparent;
              resize: none;
              padding: ${textarea.style.padding};
              margin: 0;
              line-height: 1em;
              font-size: inherit;
              color: inherit;
              overflow: hidden;
            `;
            div.className = textarea.className;
            textarea.parentNode?.replaceChild(div, textarea);

            // Ensure title positioning is preserved
            const title = clonedDoc.querySelector("h1");
            if (title) {
              (title as HTMLElement).style.transform =
                "translateX(0.75rem) translateY(-1rem)";
            }

            const containers = clonedDoc.querySelectorAll(".relative");
            containers.forEach((container) => {
              (container as HTMLElement).style.margin = "0";
              (container as HTMLElement).style.padding = "0";
            });
          }
        },
      });

      // Show buttons again
      if (buttonsDiv) {
        buttonsDiv.style.display = "flex";
      }

      const link = document.createElement("a");
      link.download = "lockin2025.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className=" w-screen h-screen flex items-center justify-center bg-black">
      <div
        ref={wrapperRef}
        className="relative max-w-[1920px] max-h-[1080px] w-full h-full flex items-center justify-center bg-black"
      >
        <div
          className="relative w-[8cm] h-[11cm] sm:w-[10cm] sm:h-[13cm] md:w-[14cm] md:h-[18cm] bg-[#efefef] "
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <div
            ref={contentRef}
            className={cn(
              "z-10 absolute top-0 left-0 w-full h-full p-0 text-3xl sm:text-4xl md:text-5xl  text-blue-600",
              isDrawMode ? "cursor-crosshair" : "cursor-text"
            )}
          >
            <svg
              ref={svgRef}
              className="absolute top-0 left-0 w-full h-full z-20"
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              style={{
                touchAction: "none",
                userSelect: "none",
              }}
            >
              {paths.map((path) => (
                <path
                  key={path.id}
                  d={pointsToPath(path.points)}
                  stroke="#2563eb"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPath.length > 0 && (
                <path
                  d={pointsToPath(currentPath)}
                  stroke="#2563eb"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            <div
              className={`absolute top-0 left-0 w-full h-full overflow-hidden ${
                isDrawMode ? "pointer-events-none" : "z-20"
              }`}
            >
              <div className="relative pt-3 md:pt-6 px-3 md:px-6">
                <h1 className="text-5xl sm:text-6xl md:text-8xl leading-none">
                  NY 2025
                </h1>
                <div className="">
                  <svg
                    className="absolute -bottom-2 md:-bottom-4 left-2 w-full"
                    height="20"
                    viewBox={
                      mediaQuery === "md" || mediaQuery === "lg"
                        ? "40 0 400 20"
                        : "20 0 550 5"
                    }
                  >
                    <path
                      d={UNDERLINE_PATH}
                      stroke="#2563eb"
                      strokeWidth={
                        mediaQuery === "md" || mediaQuery === "lg"
                          ? "3"
                          : mediaQuery === "sm"
                          ? "2.5"
                          : "2"
                      }
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => {
                  const lines = e.target.value.split("\n");
                  if (lines.length <= 10) {
                    onContentChange(e.target.value);
                  } else {
                    onContentChange(lines.slice(0, 10).join("\n"));
                  }
                }}
                className="w-full h-full bg-transparent focus:outline-none resize-none px-6 md:px-12 pt-6 md:pt-8 overflow-hidden"
                maxLength={500}
                style={{
                  lineHeight: "1em",
                }}
              />
            </div>
          </div>
        </div>
        <div className="absolute top-6 -translate-x-1/2 left-1/2 flex gap-0 mx-0 md:gap-2 z-30 control-buttons">
          <Toggle
            pressed={!isDrawMode}
            onPressedChange={() => setIsDrawMode(false)}
            className="data-[state=on]:bg-transparent data-[state=off]:bg-transparent h-6 w-2 md:h-8 md:w-8"
            size={"sm"}
          >
            <Type
              className={`h-2 w-2 md:h-4 md:w-4 ${
                !isDrawMode ? "text-white" : "text-gray-400"
              }`}
            />
          </Toggle>
          <Toggle
            pressed={isDrawMode}
            onPressedChange={() => setIsDrawMode(true)}
            className="data-[state=on]:bg-transparent data-[state=off]:bg-transparent h-6 w-2 md:h-8 md:w-8"
            size={"sm"}
          >
            <Pencil
              className={`h-2 w-2 md:h-4 md:w-4 ${
                isDrawMode ? "text-white" : "text-gray-400"
              }`}
            />
          </Toggle>
          <Toggle
            onPressedChange={handleDownload}
            className="data-[state=on]:bg-transparent data-[state=off]:bg-transparent h-6 w-4 md:h-8 md:w-8"
            size={"sm"}
          >
            <Download className="h-2 w-2 md:h-4 md:w-4 text-gray-400" />
          </Toggle>
          <Toggle
            onPressedChange={handleReset}
            className="data-[state=on]:bg-transparent data-[state=off]:bg-transparent h-6 w-2 md:h-8 md:w-8"
            size={"sm"}
          >
            <RotateCcw className="h-2 w-2 md:h-4 md:w-4 text-gray-400" />
          </Toggle>
        </div>
      </div>
    </div>
  );
}
