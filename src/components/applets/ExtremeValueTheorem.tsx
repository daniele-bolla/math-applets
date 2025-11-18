import { useState, useCallback } from "react";
import JXG from "jsxgraph";
import JSXGraphBoard from "../JSXGraphBoard";
import AppButton from "../AppButton";

type ExampleKey = "discontinuousAtMax" | "openInterval";

interface Example {
    name: string;
    interval: [number, number];
    isOpen: boolean;
    render: (board: JXG.Board, a: number, b: number) => void;
}

const examples: Record<ExampleKey, Example> = {
    discontinuousAtMax: {
        name: "Discontinuous at Maximum",
        interval: [0, 4],
        isOpen: false,
        render: (board, a, b) => {
            // const f = (x: number) => -(x - 2) * (x - 2) + 3;
            const f = (x: number) => -Math.pow(x, 2) + 4 * x - 1;

            board.create("functiongraph", [f, a, 1.999], {
                strokeColor: "#2196F3",
                strokeWidth: 3,
            });
            board.create("functiongraph", [f, 2.001, b], {
                strokeColor: "#2196F3",
                strokeWidth: 3,
            });
            // max point at (2, 3)
            board.create("point", [2, 3], {
                size: 4,
                fillColor: "white",
                strokeColor: "#E91E63",
                strokeWidth: 2,
                fixed: true,
            });
        },
    },
    openInterval: {
        name: "Open Interval",
        interval: [1, 3],
        isOpen: true,
        render: (board, a, b) => {
            const f = (x: number) => x;

            board.create("functiongraph", [f, a, b], {
                strokeColor: "#2196F3",
                strokeWidth: 3,
            });

            board.create("point", [a, f(a)], {
                size: 4,
                fillColor: "white",
                strokeColor: "#E91E63",
                strokeWidth: 2,
                fixed: true,
            });

            board.create("point", [b, f(b)], {
                size: 4,
                fillColor: "white",
                strokeColor: "#E91E63",
                strokeWidth: 2,
                fixed: true,
            });
        },
    },
};

export default function EVTApplet() {
    const [currentExample, setCurrentExample] =
        useState<ExampleKey>("discontinuousAtMax");

    const setup = useCallback(
        (board: JXG.Board) => {
            const example = examples[currentExample];
            const [a, b] = example.interval;
            const isOpen = example.isOpen;

            example.render(board, a, b);

            const pointA = board.create("point", [a, 0], {
                name: isOpen ? "(" : "[",
                size: 4,
                fillColor: isOpen ? "white" : "#4CAF50",
                strokeColor: "#4CAF50",
                strokeWidth: isOpen ? 2 : 1,
                fixed: true,
                label: { offset: [-15, -15], fontSize: 16 },
            });

            const pointB = board.create("point", [b, 0], {
                name: isOpen ? ")" : "]",
                size: 4,
                fillColor: isOpen ? "white" : "#F44336",
                strokeColor: "#F44336",
                strokeWidth: isOpen ? 2 : 1,
                fixed: true,
                label: { offset: [10, -15], fontSize: 16 },
            });

            board.create("segment", [pointA, pointB], {
                strokeColor: "#FF9800",
                strokeWidth: 4,
                fixed: true,
            });
        },
        [currentExample]
    );

    return (
        <div className="flex flex-col items-center w-full gap-4">
            <JSXGraphBoard
                config={{
                    boundingbox: [-1, 4, 5, -1],

                }}
                setup={setup}
            />

            <div className="flex gap-2">
                {(Object.keys(examples) as ExampleKey[]).map((key) => (
                    <AppButton
                        key={key}
                        active={currentExample === key}
                        onClick={() => setCurrentExample(key)}
                    >
                        {examples[key].name}
                    </AppButton>
                ))}
            </div>
        </div>
    );
}
