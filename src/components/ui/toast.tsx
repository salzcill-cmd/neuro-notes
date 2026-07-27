"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  error: "border-red-500/30 bg-red-500/10 text-red-500",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-500",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-500",
};

function ToastContainer() {
  const toast = useUIStore((s) => s.toast);
  const clearToast = useUIStore((s) => s.clearToast);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm min-w-[280px]",
              styles[toast.type]
            )}
          >
            {React.createElement(icons[toast.type], { className: "h-4 w-4 shrink-0" })}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={clearToast}
              className="shrink-0 rounded-md p-0.5 hover:bg-white/10 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { ToastContainer };
