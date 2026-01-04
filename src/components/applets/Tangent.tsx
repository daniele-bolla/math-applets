import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
    COLORS,
    createFunctionGraph,
    createText,
    createGlider,
    createPoint,
    createSecant,
    createDashedSegment,
    createArrowSegment,
    createSlider,
    createTangent
} from "../../utils/jsxgraph";

export default function TangentApplet() {
    return (
        <JSXGraphBoard
            config={{ boundingbox: [-1, 5, 5, -1], axis: true }}
            setup={(board: JXG.Board) => {

                const f = (x: number) => x * x;
                const fPrime = (x: number) => 2 * x;

                const graph = createFunctionGraph(board, f, [-10, 10]);

                createText(board, [3.5, f(3.5) + 0.3], 'f(x) = x²', {
                    fixed: true,
                });

                const pointA = createGlider(board, [0.5, f(0.5), graph], {
                    name: '(a, f(a))',
                }, COLORS.green);

                const hSlider = createSlider(board,
                    [0.5, -0.5],
                    [3, -0.5],
                    [0.001, 1, 3],
                    { name: 'h' }
                );

                // Point B = A + h
                const pointB = createPoint(board,
                    [() => pointA.X() + hSlider.Value(), () => f(pointA.X() + hSlider.Value())],
                    {
                        name: '(a + h, f(a + h))',
                        fixed: true,
                        visible: () => hSlider.Value() >= 0.1
                    },
                    COLORS.red
                );

                // Secant line through A and B
                createSecant(board, [pointA, pointB], {
                    visible: () => hSlider.Value() >= 0.1
                }, COLORS.red);

                // Secant line label
                createText(board,
                    [() => (pointA.X() + pointB.X()) / 2 + 0.2, () => (pointA.Y() + pointB.Y()) / 2 + 0.3],
                    () => `Secant: slope = ${((pointB.Y() - pointA.Y()) / (hSlider.Value())).toFixed(3)}`,
                    {
                        fixed: true,
                    },
                    COLORS.red
                );

                // Tangent line at A
                const tangentPoint = createPoint(board,
                    [() => pointA.X() + 1, () => pointA.Y() + fPrime(pointA.X())],
                    { visible: false }
                );

                createTangent(board, [pointA, tangentPoint], {
                    visible: () => hSlider.Value() < 0.1
                }, COLORS.purple);

                createText(board,
                    [() => pointA.X() + 0.5, () => pointA.Y() + fPrime(pointA.X()) * 0.5 + 0.3],
                    () => `Tangent: f'(${pointA.X()}) = ${fPrime(pointA.X()).toFixed(3)}`,
                    {
                        fontSize: 12,
                        fixed: true,
                        visible: () => hSlider.Value() < 0.1
                    },
                    COLORS.purple
                );

                // Dashed segments
                createDashedSegment(board,
                    [[() => pointA.X(), () => 0], pointA],
                    {},
                    COLORS.green
                );

                createDashedSegment(board,
                    [[() => pointB.X(), () => 0], pointB],
                    {},
                    COLORS.red
                );

                createArrowSegment(board,
                    [[() => pointA.X(), () => 0], [() => pointB.X(), () => 0]],
                    {},
                    COLORS.orange
                );

                createText(board,
                    [() => (pointA.X() + pointB.X()) / 2, () => -0.25],
                    () => `h = ${hSlider.Value().toFixed(3)}`,
                    {
                    },
                    COLORS.orange
                );

                createArrowSegment(board,
                    [[() => pointB.X(), () => pointA.Y()], pointB],
                    {},
                    COLORS.orange
                );

                createText(board,
                    [() => pointB.X() + 0.15, () => (pointA.Y() + pointB.Y()) / 2],
                    () => `Δf = ${(pointB.Y() - pointA.Y()).toFixed(3)}`,
                    {
                    },
                    COLORS.orange
                );
            }}
        />
    );
}
