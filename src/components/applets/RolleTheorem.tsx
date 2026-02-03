import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
  COLORS,
  createFunctionGraph,
  createGlider,
  createPoint,
  createDashedSegment,
} from "../../utils/jsxgraph";

export default function RolleTheoremApplet() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-3, 4, 3, -3], axis: true }}
      setup={(board: JXG.Board) => {
        // Symmetric quartic function (even function)
        const f = (x: number) => x * x * x * x - 2 * x * x;
        const graph = createFunctionGraph(board, f, [-10, 10]);

        // constrain glider a to interval on x-axis
        const interval = board.create("segment", [[-2.8, 0], [2.8, 0]], {
          visible: false,
          fixed: true,
        });

        // a is draggable
        const pointA = createGlider(board, [-1, 0, interval], { name: "a" }, COLORS.green);

        // b is computed so that f(a) = f(b); here we use b = -a
        const pointB = createPoint(
          board,
          [() => -pointA.X(), 0],
          { name: "b", fixed: true },
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

        createDashedSegment(board, [() => [pointA.X(), 0], pointFA], {}, COLORS.green);
        createDashedSegment(board, [() => [pointB.X(), 0], pointFB], {}, COLORS.red);

        // Rolle visibility helper
        const rolleConditionHolds = () => {
          // exact equality by construction, but exclude degenerate case a=b (i.e. a=0)
          return Math.abs(pointA.X() - pointB.X()) > 1e-6;
        };

        const xiVisible = (xi: number) => {
          const a = pointA.X();
          const b = pointB.X();
          return (
            rolleConditionHolds() &&
            xi > Math.min(a, b) &&
            xi < Math.max(a, b)
          );
        };

        // Critical points of f'(x)=4x(x^2-1): xi = -1, 0, 1
        const xis = [-1, 0, 1];

        xis.forEach((xi) => {
          const pointXiX = createPoint(
            board,
            [xi, 0],
            { name: `ξ`, visible: () => xiVisible(xi) },
            COLORS.purple
          );

          const pointXi = createPoint(
            board,
            [xi, f(xi)],
            { name: "f(ξ)", visible: () => xiVisible(xi) },
            COLORS.purple
          );

          board.create("tangent", [pointXi, graph], {
            strokeColor: COLORS.purple,
            strokeWidth: 3,
            highlight: false,
            visible: () => xiVisible(xi),
          });

          createDashedSegment(
            board,
            [pointXiX, pointXi],
            { visible: () => xiVisible(xi) },
            COLORS.purple
          );
        });
      }}
    />
  );
}