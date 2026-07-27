"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  StickyNote,
  Type,
  Image,
  Link2,
  FileText,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  MousePointer2,
  Hand,
  Grid3x3,
  Save,
  Download,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useAppStore, useNoteStore, useUIStore } from "@/stores";
import { cn, generateId } from "@/lib/utils";

interface CanvasCard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  type: "note" | "card" | "text" | "link";
  fontSize?: number;
  rotation?: number;
}

const cardColors = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Purple", value: "#ddd6fe" },
  { name: "Orange", value: "#fed7aa" },
  { name: "White", value: "#ffffff" },
];

export function CanvasView() {
  const [cards, setCards] = React.useState<CanvasCard[]>([
    {
      id: generateId(),
      x: 100,
      y: 100,
      width: 220,
      height: 160,
      content: "Welcome to Canvas!\n\nDouble-click anywhere to add a new card.",
      color: "#bfdbfe",
      type: "card",
    },
    {
      id: generateId(),
      x: 400,
      y: 150,
      width: 200,
      height: 140,
      content: "Ideas go here",
      color: "#fef08a",
      type: "card",
    },
    {
      id: generateId(),
      x: 250,
      y: 380,
      width: 200,
      height: 140,
      content: "Research notes",
      color: "#bbf7d0",
      type: "card",
    },
  ]);

  const [selectedCard, setSelectedCard] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = React.useState<"select" | "pan">("select");
  const canvasRef = React.useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (activeTool === "pan") return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const newCard: CanvasCard = {
      id: generateId(),
      x: x - 110,
      y: y - 70,
      width: 220,
      height: 140,
      content: "",
      color: cardColors[Math.floor(Math.random() * cardColors.length)].value,
      type: "card",
    };

    setCards((prev) => [...prev, newCard]);
    setSelectedCard(newCard.id);
  };

  const handleCardMouseDown = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    if (activeTool === "pan") return;

    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedCard(cardId);
    setIsDragging(true);
    setDragOffset({
      x: (e.clientX - rect.left - pan.x) / zoom - card.x,
      y: (e.clientY - rect.top - pan.y) / zoom - card.y,
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "pan") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    setSelectedCard(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedCard) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;

      setCards((prev) =>
        prev.map((c) => (c.id === selectedCard ? { ...c, x, y } : c))
      );
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
  };

  const handleCardUpdate = (id: string, content: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content } : c))
    );
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setSelectedCard(null);
  };

  const addCard = (color: string) => {
    const newCard: CanvasCard = {
      id: generateId(),
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
      width: 220,
      height: 140,
      content: "",
      color,
      type: "card",
    };
    setCards((prev) => [...prev, newCard]);
    setSelectedCard(newCard.id);
  };

  return (
    <div className="relative h-full overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 rounded-xl border border-border bg-background/90 backdrop-blur-md p-1.5 shadow-lg"
        >
          <Tooltip content="Select (V)">
            <Button
              variant={activeTool === "select" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setActiveTool("select")}
            >
              <MousePointer2 className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Pan (H)">
            <Button
              variant={activeTool === "pan" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setActiveTool("pan")}
            >
              <Hand className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Tooltip content="Add Sticky Note">
            <Button variant="ghost" size="icon-sm" onClick={() => addCard("#fef08a")}>
              <StickyNote className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Add Text Card">
            <Button variant="ghost" size="icon-sm" onClick={() => addCard("#ffffff")}>
              <Type className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <Tooltip content="Zoom In">
            <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <span className="text-xs text-muted-foreground px-1 min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Tooltip content="Zoom Out">
            <Button variant="ghost" size="icon-sm" onClick={() => setZoom((z) => Math.max(z - 0.1, 0.2))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Reset View">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </motion.div>
      </div>

      {/* Info */}
      <div className="absolute top-4 right-4 z-20">
        <Badge variant="secondary" className="text-xs">
          {cards.length} cards
        </Badge>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={cn(
          "absolute inset-0 cursor-crosshair",
          activeTool === "pan" && (isPanning ? "cursor-grabbing" : "cursor-grab"),
          isDragging && "cursor-grabbing"
        )}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: `${pan.x % 24}px ${pan.y % 24}px`,
            opacity: 0.5,
          }}
        />

        {/* Cards */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className={cn(
                "absolute rounded-xl shadow-lg border transition-shadow cursor-move group",
                selectedCard === card.id
                  ? "ring-2 ring-primary shadow-xl"
                  : "hover:shadow-xl"
              )}
              style={{
                left: card.x,
                top: card.y,
                width: card.width,
                height: card.height,
                backgroundColor: card.color,
                borderColor: selectedCard === card.id ? "hsl(var(--primary))" : "rgba(0,0,0,0.1)",
              }}
              onMouseDown={(e) => handleCardMouseDown(e, card.id)}
            >
              <textarea
                value={card.content}
                onChange={(e) => handleCardUpdate(card.id, e.target.value)}
                className="w-full h-full bg-transparent resize-none outline-none p-3 text-sm text-foreground/80 placeholder:text-foreground/30"
                placeholder="Type something..."
              />

              {/* Card Actions */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                  className="h-6 w-6 rounded-md bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {/* Color Picker */}
              {selectedCard === card.id && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 border border-border shadow-lg">
                  {cardColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCards((prev) =>
                          prev.map((c) =>
                            c.id === card.id ? { ...c, color: color.value } : c
                          )
                        );
                      }}
                      className={cn(
                        "h-5 w-5 rounded-full border transition-transform hover:scale-110",
                        card.color === color.value && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty state hint */}
      {cards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-muted-foreground">
            <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Double-click to add a card</p>
          </div>
        </div>
      )}
    </div>
  );
}
