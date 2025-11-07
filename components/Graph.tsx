// components/Graph.tsx
"use client";

import { useEffect, useRef } from "react";
import JSXGraph from "jsxgraph";

export default function Graph() {
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!boxRef.current) return;

        // Clear any previous board
        boxRef.current.innerHTML = "";

        // Create a new board
        const board = JSXGraph.JSXGraph.initBoard(boxRef.current.id, {
            boundingbox: [-5, 5, 5, -5],
            axis: true,
        });

        // Example function: f(x) = x^2 - 2
        board.create("functiongraph", [(x: number) => x * x - 2]);

        return () => {
            JSXGraph.JSXGraph.freeBoard(board);
        };
    }, []);

    return (
        <div
            id="jxgbox"
            ref={boxRef}
            className="w-[600px] h-[400px] border border-gray-300"
        ></div>
    );
}
