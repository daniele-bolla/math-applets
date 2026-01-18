import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
    COLORS,
    createFunctionGraph,
    createGlider,
    createPoint,
    createDashedSegment
} from "../../utils/jsxgraph";

export default function RolleTheoremApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-3, 4, 3, -3], axis: true }}
            setup={(board: JXG.Board) => {

                // Symmetric quartic function with roots at -sqrt(2), 0, sqrt(2)
                const f = (x: number) => x * x * x * x - 2 * x * x;
                const graph = createFunctionGraph(board, f, [-10, 10]);

                // constrain gliders to interval
                const interval = board.create("segment", [[-4, 0], [4, 0]], {
                    visible: false,
                    fixed: true,
                });

                const pointA = createGlider(
                    board,
                    [-1, 0, interval],
                    { name: "a" },
                    COLORS.green
                );

                const pointB = createGlider(
                    board,
                    [1, 0, interval],
                    { name: "b" },
                    COLORS.red
                );

                // f(a), f(b)
                const pointFA = createPoint(
                    board,
                    [() => pointA.X(), () => f(pointA.X())],
                    { name: "f(a)", fixed: true },
                    COLORS.green
                );

                const pointFB = createPoint(
                    board,
                    [() => pointB.X(), () => f(pointB.X())],
                    { name: "f(b)", fixed: true },
                    COLORS.red
                );

                createDashedSegment(
                    board,
                    [() => [pointA.X(), 0], pointFA],
                    {},
                    COLORS.green
                );

                createDashedSegment(
                    board,
                    [() => [pointB.X(), 0], pointFB],
                    {},
                    COLORS.red
                );

                const eps = 0.1;

                function rolleConditionHolds() {
                    return Math.abs(f(pointA.X()) - f(pointB.X())) < eps;
                }

                function xiVisible(xi: number) {
                    const a = pointA.X();
                    const b = pointB.X();
                    return rolleConditionHolds() &&
                        xi > Math.min(a, b) &&
                        xi < Math.max(a, b);
                }
                
                const xis = [-1, 0, 1];


                xis.forEach((xi) => {

                    const pointXiX = createPoint(
                        board,
                        [xi, 0],
                        {
                            name: `ξ`,
                            visible: () => xiVisible(xi),
                        },
                        COLORS.purple
                    );

                    const pointXi = createPoint(
                        board,
                        [xi, f(xi)],
                        {
                            name: "f(ξ)",
                            visible: () => xiVisible(xi),
                        },
                        COLORS.purple
                    );

                    board.create("tangent", [pointXi, graph], {
                        strokeColor: COLORS.purple,
                        strokeWidth: 3,
                        highlight:false,
                        visible: () => xiVisible(xi),
                    });

                    createDashedSegment(
                        board,
                        [pointXiX, pointXi],
                        {
                            visible: () => xiVisible(xi),
                        },
                        COLORS.purple
                    );
                });
            }}
        />
    );
}