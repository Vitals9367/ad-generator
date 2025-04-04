import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CanvasProps
  extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  onReady?: (ctx: CanvasRenderingContext2D) => void;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ className, onReady, ...props }, ref) => {
    const internalRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = internalRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size to match display size
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Scale context to match device pixel ratio
      ctx.scale(dpr, dpr);

      // Call onReady with the context
      onReady?.(ctx);
    }, [onReady]);

    return (
      <canvas
        ref={(node) => {
          // Handle the forwarded ref
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          // Handle the internal ref
          internalRef.current = node;
        }}
        className={cn("block", className)}
        {...props}
      />
    );
  },
);

Canvas.displayName = "Canvas";
