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
            style={{ width: "400px", height: "400px" }}
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="text-sm">Loading graph…</span>
                    </div>
                </div>
            )}
            <div ref={ref} id={idRef.current} className="w-full h-full" />
        </div>
    );
}
