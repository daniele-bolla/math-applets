import { useEffect, useRef, useState } from "react";
import JXG from "jsxgraph";

export interface JSXGraphBoardProps {
    setup: (board: JXG.Board) => void;
    config?: Partial<JXG.BoardAttributes>;
}

export default function JSXGraphBoard({
    setup,
    config = {},
}: JSXGraphBoardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);

    const idRef = useRef(`board-${Math.random().toString(36).slice(2)}`);

    useEffect(() => {
        if (!ref.current) return;

        const board = JXG.JSXGraph.initBoard(ref.current.id, {
            boundingbox: [-5, 5, 5, -5],
            axis: true,
            showCopyright: false,
            showNavigation: false,
            keepAspectRatio: true,
            showFullscreen: true,
            ...config,
        });

        const onFirstUpdate = () => {
            setLoading(false);
            board.off("update", onFirstUpdate);
        };
        board.on("update", onFirstUpdate);

        setup(board);

        return () => JXG.JSXGraph.freeBoard(board);
    }, [setup]);

    return (
        <div
            className="relative mx-auto border border-gray-300 rounded shadow"
            style={{ height: "70vh", aspectRatio: "1 / 1" }}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="text-sm">Loading graph…</span>
                    </div>
                </div>
            )}

            {/* ✅ Info Button */}
            <button
                type="button"
                onClick={() => setShowHelp((prev) => !prev)}
                className="absolute cursor-pointer top-2 left-2 z-30 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-full h-8 w-8 flex items-center justify-center shadow-sm hover:bg-white text-slate-700"
            >
                i
            </button>

            {/* ✅ Help Box (toggles) */}
            {showHelp && (
                <div className="absolute top-12 left-2 z-20 text-xs bg-white/95 backdrop-blur-sm border border-gray-300 rounded px-3 py-2 shadow-sm max-w-[200px] leading-tight">
                    <ul className="list-disc ml-1 space-y-1 mt-1">
                        <li>Hold <kbd>Shift</kbd> + scroll to zoom</li>
                        <li>Hold <kbd>Shift</kbd> + drag to move</li>
                        <li>Points shaped like &lt;&gt; act as sliders</li>
                    </ul>
                </div>
            )}

            <div ref={ref} id={idRef.current} className="w-full h-full" />
        </div>
    );

}
