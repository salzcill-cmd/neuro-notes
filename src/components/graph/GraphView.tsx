"use client";

import * as React from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  Filter,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { useNoteStore, useAppStore } from "@/stores";
import { cn } from "@/lib/utils";

const nodeColors: Record<string, string> = {
  note: "#60a5fa",
  tag: "#2dd4bf",
  folder: "#f59e0b",
  default: "#64748b",
};

function NoteNode({ data }: { data: { label: string; type: string; noteCount?: number; color?: string } }) {
  const color = data.color || nodeColors[data.type] || nodeColors.default;

  return (
    <div
      className="px-4 py-2 rounded-lg border-2 bg-background shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium truncate max-w-[120px]">{data.label}</span>
      </div>
      {data.noteCount !== undefined && (
        <span className="text-[10px] text-muted-foreground">{data.noteCount} notes</span>
      )}
    </div>
  );
}

const nodeTypes = {
  noteNode: NoteNode,
};

export function GraphView() {
  const notes = useNoteStore((s) => s.notes);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [filterType, setFilterType] = React.useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);

  const activeNotes = notes.filter((n) => !n.isDeleted && !n.isArchived);

  const allTags = React.useMemo(() => {
    const tagMap = new Map<string, number>();
    activeNotes.forEach((n) => {
      n.tags.forEach((t) => {
        tagMap.set(t.name, (tagMap.get(t.name) || 0) + 1);
      });
    });
    return Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [activeNotes]);

  const graphNodes: Node[] = React.useMemo(() => {
    const nodes: Node[] = [];
    const positions: Record<string, { x: number; y: number }> = {};
    const angleStep = (2 * Math.PI) / Math.max(activeNotes.length, 1);
    const radius = Math.max(150, activeNotes.length * 30);

    activeNotes.forEach((note, i) => {
      const angle = i * angleStep;
      const x = Math.cos(angle) * radius + 400;
      const y = Math.sin(angle) * radius + 300;
      positions[note.id] = { x, y };

      if (filterType && note.tags.every((t) => t.name !== filterType)) return;

      nodes.push({
        id: note.id,
        type: "noteNode",
        position: { x, y },
        data: {
          label: note.title || "Untitled",
          type: "note",
          color: note.color || nodeColors.note,
        },
      });
    });

    activeNotes.forEach((note) => {
      note.tags.forEach((tag) => {
        const tagNodeId = `tag-${tag.name}`;
        if (!nodes.find((n) => n.id === tagNodeId)) {
          const tagNotes = activeNotes.filter((n) =>
            n.tags.some((t) => t.name === tag.name)
          );
          const avgX =
            tagNotes.reduce((acc, n) => acc + (positions[n.id]?.x || 0), 0) /
            Math.max(tagNotes.length, 1);
          const avgY =
            tagNotes.reduce((acc, n) => acc + (positions[n.id]?.y || 0), 0) /
            Math.max(tagNotes.length, 1);

          nodes.push({
            id: tagNodeId,
            type: "noteNode",
            position: {
              x: avgX + ((tag.name.charCodeAt(0) % 20) - 10) * 10,
              y: avgY + ((tag.name.charCodeAt(1) % 20) - 10) * 10,
            },
            data: {
              label: tag.name,
              type: "tag",
              noteCount: tagNotes.length,
              color: nodeColors.tag,
            },
          });
        }
      });
    });

    return nodes;
  }, [activeNotes, filterType]);

  const graphEdges: Edge[] = React.useMemo(() => {
    const edges: Edge[] = [];
    const edgeSet = new Set<string>();

    activeNotes.forEach((note) => {
      note.links.forEach((link) => {
        const edgeId = `${note.id}-${link.targetNoteId}`;
        if (!edgeSet.has(edgeId)) {
          edgeSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: note.id,
            target: link.targetNoteId,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#60a5fa", strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#60a5fa" },
          });
        }
      });
    });

    activeNotes.forEach((note) => {
      note.tags.forEach((tag) => {
        const edgeId = `${note.id}-tag-${tag.name}`;
        if (!edgeSet.has(edgeId)) {
          edgeSet.add(edgeId);
          edges.push({
            id: edgeId,
            source: note.id,
            target: `tag-${tag.name}`,
            type: "smoothstep",
            style: { stroke: "#2dd4bf", strokeWidth: 1, opacity: 0.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#2dd4bf" },
          });
        }
      });
    });

    return edges;
  }, [activeNotes]);

  const [nodes, setNodes] = React.useState<Node[]>(graphNodes);
  const [edges, setEdges] = React.useState<Edge[]>(graphEdges);

  const onNodesChange: OnNodesChange = React.useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange: OnEdgesChange = React.useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const dataKey = `${activeNotes.length}-${activeNotes.map((n) => n.id).join(",")}-${filterType}`;
  const prevKeyRef = React.useRef(dataKey);
  React.useEffect(() => {
    if (prevKeyRef.current !== dataKey) {
      prevKeyRef.current = dataKey;
      setNodes(graphNodes);
      setEdges(graphEdges);
    }
  });

  const onNodeClick = React.useCallback(
    (_: React.MouseEvent, node: Node) => {
      const note = activeNotes.find((n) => n.id === node.id);
      if (note) {
        setCurrentNote(note);
        setCurrentNoteId(note.id);
      }
    },
    [activeNotes, setCurrentNote, setCurrentNoteId]
  );

  return (
    <div className={cn("relative h-full", isFullscreen && "fixed inset-0 z-50 bg-background")}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-border bg-background/80 backdrop-blur-md p-2"
        >
          <h3 className="text-sm font-semibold px-2">Knowledge Graph</h3>
          <Badge variant="secondary" className="text-xs">
            {graphNodes.length} nodes
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {graphEdges.length} edges
          </Badge>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 rounded-xl border border-border bg-background/80 backdrop-blur-md p-1"
        >
          <Tooltip content="Filter by tag">
            <Button
              variant={filterType ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Fullscreen">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </Tooltip>
        </motion.div>
      </div>

      {/* Tag Filter Dropdown */}
      {showFilterMenu && (
        <div className="absolute top-16 right-4 z-10 w-56 rounded-xl border border-border bg-background shadow-xl p-2">
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <span className="text-xs font-semibold text-muted-foreground">Filter by Tag</span>
            <button onClick={() => setShowFilterMenu(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
          {filterType && (
            <button
              onClick={() => { setFilterType(null); setShowFilterMenu(false); }}
              className="w-full text-left px-2 py-1.5 rounded-md text-xs text-primary hover:bg-accent/50 transition-colors"
            >
              Clear filter
            </button>
          )}
          <div className="max-h-48 overflow-y-auto space-y-px">
            {allTags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => { setFilterType(tag.name); setShowFilterMenu(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors",
                  filterType === tag.name
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-accent/50 text-foreground"
                )}
              >
                <span className="truncate">#{tag.name}</span>
                <span className="text-muted-foreground tabular-nums">{tag.count}</span>
              </button>
            ))}
            {allTags.length === 0 && (
              <p className="px-2 py-2 text-xs text-muted-foreground text-center">No tags found</p>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Badge */}
      {filterType && !showFilterMenu && (
        <div className="absolute top-16 right-4 z-10">
          <Badge variant="info" className="text-xs">
            Filtered: {filterType}
            <button
              onClick={() => setFilterType(null)}
              className="ml-1 hover:text-foreground"
            >
              ×
            </button>
          </Badge>
        </div>
      )}

      {/* Graph */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="currentColor"
          className="opacity-10"
        />
        <Controls
          className="!rounded-lg !border-border !bg-background/80 !backdrop-blur-md"
          showInteractive={false}
        />
        <MiniMap
          className="!rounded-lg !border-border !bg-background/80"
          nodeColor={(node) => {
            const data = node.data as { type?: string };
            return nodeColors[data.type || "default"] || nodeColors.default;
          }}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>

      {/* Empty State */}
      {activeNotes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Info className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No notes to graph</h3>
            <p className="text-sm text-muted-foreground">
              Create some notes to see your knowledge graph
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
