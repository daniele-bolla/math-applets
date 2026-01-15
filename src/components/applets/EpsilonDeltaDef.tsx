import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
  COLORS,
  createFunctionGraph,
  createGlider,
  createPoint,
  createLine,
} from "../../utils/jsxgraph";

export default function EpsilonDeltaDefApplet() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-3, 5, 5.5, -2],
        axis: true,
      }}
      setup={(board: JXG.Board) => {
        // ---------------------------
        // Function selector (buttons)
        // ---------------------------
        const DISCONTINUITY = 1.25;

        type Mode = "discontinuous" |  "arctan";
        let mode: Mode = "discontinuous";

        const f = (x: number) => {
          if (mode === "arctan") return Math.atan(x);     

          if (x < DISCONTINUITY) return 0.3 * Math.pow(x, 3);
          return Math.pow(x, 2);
        };

        const bbRight = () => board.getBoundingBox()[2];
        const bbTop = () => board.getBoundingBox()[1];

        const createButton = (row: number, label: string, nextMode: Mode, color: string) => {
          const btn = board.create(
            "button",
            [
              () => bbRight() - 2.4,        
              () => bbTop() - 0.6 - 0.55 * row,
              label,
              () => {
                mode = nextMode;
                board.update();
              },
            ],
            {
              fixed: true,
              strokeColor: color,
              cssStyle: "width: 150px;",
            }
          ) as JXG.Button;

          return btn;
        };

        createButton(0, "discontinuous", "discontinuous", COLORS.red);
        createButton(2, "atan(x)", "arctan", COLORS.orange);

        // ---------------------------
        // Function graph
        // ---------------------------
        const fGraph = createFunctionGraph(
          board,
          f,
          [-10, 10],
          { strokeWidth: 2 },
          COLORS.blue
        );

        // ---------------------------
        // Point a on x-axis
        // ---------------------------
        const pointA = createGlider(
          board,
          [DISCONTINUITY, 0, board.defaultAxes.x],
          { name: "a", face: "<>" },
          COLORS.pink
        );

        // Point (a, f(a))
        const fpointA = createPoint(
          board,
          [() => pointA.X(), () => f(pointA.X())],
          { name: "", size: 2, fixed: true },
          COLORS.black
        );

        // Vertical line from a to f(a)
        createLine(
          board,
          [pointA, fpointA],
          { dash: 2, straightFirst: false, straightLast: false, strokeWidth: 1 },
          COLORS.black
        );

        // Point (0, f(a))
        const pointYfpointA = createPoint(
          board,
          [0, () => f(pointA.X())],
          { name: "", size: 2, fixed: true },
          COLORS.black
        );

        // Horizontal line from (a, f(a)) to y-axis
        createLine(
          board,
          [fpointA, pointYfpointA],
          { dash: 2, straightFirst: false, straightLast: false, strokeWidth: 1 },
          COLORS.black
        );

        // ===== EPSILON =====
        const epsLine = createLine(
          board,
          [() => [0, f(pointA.X())], () => [0, f(pointA.X()) + 2.5]],
          { visible: false, straightFirst: false, straightLast: false }
        );

        const epsPoint = createGlider(
          board,
          [1, f(pointA.X()) + 0.5, epsLine],
          { name: "f(a)+ε", face: "<>" },
          COLORS.green
        );

        const getEpsilon = () => Math.abs(epsPoint.Y() - f(pointA.X()));

        createLine(
          board,
          [pointYfpointA, epsPoint],
          { straightFirst: false, straightLast: false, strokeWidth: 3 },
          COLORS.green
        );

        createLine(
          board,
          [() => [0, epsPoint.Y()], () => [1, epsPoint.Y()]],
          { strokeWidth: 2, dash: 2 },
          COLORS.green
        );

        createLine(
          board,
          [() => [0, f(pointA.X()) - getEpsilon()], () => [1, f(pointA.X()) - getEpsilon()]],
          { strokeWidth: 2, dash: 2 },
          COLORS.green
        );

        // ===== DELTA =====
        const deltaLine = createLine(
          board,
          [() => [pointA.X(), 0], () => [pointA.X() + 1.5, 0]],
          { visible: false, straightFirst: false, straightLast: false }
        );

        const deltaPoint = createGlider(
          board,
          [pointA.X() + 0.75, 0, deltaLine],
          { name: "a+δ", face: "<>" },
          COLORS.orange
        );

        const getDelta = () => Math.abs(deltaPoint.X() - pointA.X());

        createLine(
          board,
          [() => [deltaPoint.X(), 0], () => [deltaPoint.X(), 1]],
          { strokeWidth: 2, dash: 2 },
          COLORS.orange
        );

        // NOTE: your comment says "a - ε" but this is "a - δ"; also coordinates were swapped in your original.
        createLine(
          board,
          [() => [pointA.X() - getDelta(), 0], () => [pointA.X() - getDelta(), 1]],
          { strokeWidth: 2, dash: 2 },
          COLORS.orange
        );

        createLine(
          board,
          [pointA, deltaPoint],
          { straightFirst: false, straightLast: false, strokeWidth: 3 },
          COLORS.orange
        );

        // ===== POINT X =====
        const xLine = createLine(
          board,
          [() => [pointA.X() - getDelta(), 0], () => [deltaPoint.X(), 0]],
          { visible: false, straightFirst: false, straightLast: false }
        );

        const xPoint = createGlider(
          board,
          [pointA.X() + getDelta() / 2, 0, xLine],
          { name: "x", face: "<>" },
          COLORS.blue
        );

        const fxPoint = createPoint(
          board,
          [() => xPoint.X(), () => f(xPoint.X())],
          { name: "", size: 2, fixed: true },
          COLORS.black
        );

        const point0fx = createPoint(
          board,
          [0, () => f(xPoint.X())],
          { name: "f(x)", size: 2, fixed: true },
          COLORS.black
        );

        createLine(
          board,
          [xPoint, fxPoint],
          { dash: 2, straightFirst: false, straightLast: false, strokeWidth: 1 },
          COLORS.black
        );

        createLine(
          board,
          [fxPoint, point0fx],
          { dash: 2, straightFirst: false, straightLast: false, strokeWidth: 1 },
          COLORS.black
        );

        createLine(
          board,
          [pointA, xPoint],
          { straightFirst: false, straightLast: false, strokeWidth: 3 },
          COLORS.blue
        );

        createLine(
          board,
          [pointYfpointA, point0fx],
          { straightFirst: false, straightLast: false, strokeWidth: 3 },
          () => {
            const epsilon = getEpsilon();
            const dist = Math.abs(point0fx.Y() - pointYfpointA.Y());
            return dist < epsilon ? COLORS.green : COLORS.red;
          }
        );
      }}
    />
  );
}