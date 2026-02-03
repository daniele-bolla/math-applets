import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
  COLORS,
  createFunctionGraph,
  createGlider,
  createPoint,
  createLine,
  createButton,
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
        // Function selector (modes)
        // ---------------------------
        const DISCONTINUITY = 1.25;

        type Mode = "discontinuous" | "arctan";
        let mode: Mode = "discontinuous";

        const f = (x: number) => {
          if (mode === "arctan") return Math.atan(x);

          if (x < DISCONTINUITY) return 0.3 * Math.pow(x, 3);
          return Math.pow(x, 2);
        };


        // Local wrapper: mode buttons
        const createModeButton = (
          x: number | (() => number),
          y: number | (() => number),
          label: string,
          nextMode: Mode,
          color: string
        ) =>
          createButton(
            board,
            x,
            y,
            label,
            () => {
              mode = nextMode;
              // optional: clear status message when changing mode
              statusText.setText("");
              board.update();
            },
            color
          );

        // bottom-row layout
        const bbLeft = () => board.getBoundingBox()[0];
        const bbBottom = () => board.getBoundingBox()[3];

        const BTN_Y = () => bbBottom() + 0.35; // slightly above bottom
        const X0 = () => bbLeft() + 0.35;      // left margin
        const GAP = 2.25;                      // spacing between buttons (tune)

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
        const DELTA_SEARCH_MAX = 3.0;

        const deltaLine = createLine(
          board,
          [() => [pointA.X(), 0], () => [pointA.X() + DELTA_SEARCH_MAX, 0]],
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

        // a - δ
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

        // ===== POINT X (constrained to |x-a|<δ) =====
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

        // distance |f(x)-f(a)| (colored based on epsilon)
        createLine(
          board,
          [pointYfpointA, point0fx],
          {
            straightFirst: false,
            straightLast: false,
            strokeWidth: 3,
          },
          () => {
            const epsilon = getEpsilon();
            const dist = Math.abs(point0fx.Y() - pointYfpointA.Y());
            return dist < epsilon ? COLORS.green : COLORS.red;
          }
        );

        // ============================================================
        // Find δ: numerical search for a suitable delta for chosen epsilon
        // ============================================================
        const statusText = board.create(
          "text",
          [() => X0() + 3.1 * GAP, () => BTN_Y() + 0.05, ""],
          {
            fixed: true,
            fontSize: 14,
            anchorX: "left",
            strokeColor: "#333",
          }
        ) as JXG.Text;

        const TINY = 1e-4;

        const fa = () => f(pointA.X());
        const distFromFa = (x: number) => Math.abs(f(x) - fa());

        const findDeltaOneSide = (sign: 1 | -1, eps: number): number | null => {
          const a = pointA.X();

          // If it already fails arbitrarily close to a on this side, no δ exists
          if (distFromFa(a + sign * TINY) >= eps) return null;

          let lo = TINY;
          let hi = TINY;

          // Expand until we cross eps or hit max
          while (hi < DELTA_SEARCH_MAX && distFromFa(a + sign * hi) < eps) {
            lo = hi;
            hi *= 1.5;
          }

          if (hi >= DELTA_SEARCH_MAX) return DELTA_SEARCH_MAX;

          // Bisection near boundary dist = eps
          for (let i = 0; i < 50; i++) {
            const mid = 0.5 * (lo + hi);
            if (distFromFa(a + sign * mid) < eps) lo = mid;
            else hi = mid;
          }

          return lo;
        };

        const computeDelta = (eps: number): number | null => {
          if (!(eps > 0)) return null;
          const dR = findDeltaOneSide(1, eps);
          const dL = findDeltaOneSide(-1, eps);
          if (dR === null || dL === null) return null;
          return Math.min(dR, dL);
        };

        // ---------------------------
        // Bottom-row buttons (aligned)
        // ---------------------------
        createModeButton(() => X0() + 0 * GAP, BTN_Y, "discontinuous", "discontinuous", COLORS.red);
        createModeButton(() => X0() + 1 * GAP, BTN_Y, "atan(x)", "arctan", COLORS.orange);

        createButton(board,() => X0() + 2 * GAP, BTN_Y, "Find δ", () => {
          const eps = getEpsilon();
          const d = computeDelta(eps);

          if (d === null) {
            statusText.setText("No δ found (fails near a)");
          } else {
            statusText.setText(`δ ≈ ${d.toFixed(4)}`);
            deltaPoint.setPosition(JXG.COORDS_BY_USER, [pointA.X() + d, 0]);
          }

          board.update();
        }, COLORS.orange);
      }}
    />
  );
}