"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Table,
  List,
  ArrowUpDown,
  Trash2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/stores";
import { generateId } from "@/lib/utils";

interface DatabaseColumn {
  id: string;
  name: string;
  type: "text" | "number" | "select" | "date" | "checkbox" | "url";
  width: number;
}

interface DatabaseRow {
  id: string;
  data: Record<string, unknown>;
}

const defaultColumns: DatabaseColumn[] = [
  { id: "title", name: "Title", type: "text", width: 200 },
  { id: "status", name: "Status", type: "select", width: 120 },
  { id: "priority", name: "Priority", type: "select", width: 100 },
  { id: "date", name: "Date", type: "date", width: 120 },
  { id: "tags", name: "Tags", type: "text", width: 150 },
];

const defaultRows: DatabaseRow[] = [];

function CellEditor({ column, value, onChange }: { column: DatabaseColumn; value: unknown; onChange: (v: unknown) => void }) {
  if (column.type === "select") {
    const options = column.id === "status"
      ? ["Active", "Completed", "In Progress", "Archived"]
      : column.id === "priority"
      ? ["Low", "Medium", "High", "Urgent"]
      : [];

    return (
      <select
        value={String(value || "")}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm outline-none px-2 py-1"
      >
        <option value="">-</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (column.type === "checkbox") {
    return (
      <div className="flex items-center justify-center px-2">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded"
        />
      </div>
    );
  }

  if (column.type === "date") {
    return (
      <input
        type="date"
        value={String(value || "")}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm outline-none px-2 py-1"
      />
    );
  }

  return (
    <input
      type={column.type === "number" ? "number" : "text"}
      value={String(value || "")}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent text-sm outline-none px-2 py-1"
    />
  );
}

export function DatabaseView() {
  const [columns] = React.useState<DatabaseColumn[]>(defaultColumns);
  const [rows, setRows] = React.useState<DatabaseRow[]>(defaultRows);
  const [viewType, setViewType] = React.useState<"table" | "list">("table");
  const [searchQuery, setSearchQuery] = React.useState("");
  const showToast = useUIStore((s) => s.showToast);

  const filteredRows = React.useMemo(() => {
    if (!searchQuery) return rows;
    const lower = searchQuery.toLowerCase();
    return rows.filter((row) =>
      Object.values(row.data).some((v) =>
        String(v).toLowerCase().includes(lower)
      )
    );
  }, [rows, searchQuery]);

  const handleAddRow = () => {
    const newRow: DatabaseRow = {
      id: generateId(),
      data: { title: "", status: "", priority: "", date: "", tags: "" },
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    showToast("Row deleted", "info");
  };

  const handleCellChange = (rowId: string, columnId: string, value: unknown) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, data: { ...row.data, [columnId]: value } }
          : row
      )
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Database</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredRows.length} records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleAddRow}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Row
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewType === "table" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewType("table")}
            >
              <Table className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewType("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table View */}
        {viewType === "table" ? (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="w-10 px-3 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                    {columns.map((col) => (
                      <th
                        key={col.id}
                        className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                        style={{ minWidth: col.width }}
                      >
                        <div className="flex items-center gap-1">
                          {col.name}
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        </div>
                      </th>
                    ))}
                    <th className="w-10 px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredRows.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-border hover:bg-accent/30 group"
                      >
                        <td className="px-3 py-1.5 text-xs text-muted-foreground">
                          {index + 1}
                        </td>
                        {columns.map((col) => (
                          <td key={col.id} className="px-0 py-0">
                            <CellEditor
                              column={col}
                              value={row.data[col.id]}
                              onChange={(v) => handleCellChange(row.id, col.id, v)}
                            />
                          </td>
                        ))}
                        <td className="px-2 py-1.5">
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <button
              onClick={handleAddRow}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent/30 transition-colors border-t border-border"
            >
              <Plus className="h-3.5 w-3.5" />
              New Row
            </button>
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            {filteredRows.map((row) => (
              <motion.div
                key={row.id}
                layout
                className="flex items-center gap-3 rounded-md border border-border bg-card p-2.5 hover:bg-accent/50 transition-colors group"
              >
                <div className="flex-1 min-w-0 grid grid-cols-5 gap-4">
                  {columns.map((col) => (
                    <div key={col.id}>
                      <p className="text-[10px] text-muted-foreground mb-0.5">{col.name}</p>
                      <CellEditor
                        column={col}
                        value={row.data[col.id]}
                        onChange={(v) => handleCellChange(row.id, col.id, v)}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleDeleteRow(row.id)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="h-6" />
      </div>
    </ScrollArea>
  );
}
