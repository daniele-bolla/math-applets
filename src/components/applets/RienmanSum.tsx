import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function RandomRiemannApplet() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-4, 6, 8, -6], axis: true }}
      setup={(board: JXG.Board) => {

        const EPS = 1e-9;
        const MAX_PARTITIONS = 500;

        const LEGEND_X = 5.2;
        const LEGEND_Y_TOP = 5.5;
        const BTN_X = -3.5;
        const BTN_Y = -5.25;

        // f(x) = 0.25x^3 - x^2 - x + 2
        const f = (x: number) => 0.25 * x ** 3 - x ** 2 - x + 2;

        board.create("functiongraph", [f, -10, 10], {
          strokeColor: COLORS.blue,
          strokeWidth: 3,
          withLabel: false,
        });

        board.create("text", [LEGEND_X, LEGEND_Y_TOP, "Upper (red)"], {
          fixed: true,
          fontSize: 14,
          color: COLORS.darkRed,
          anchorX: "left",
        });

        board.create("text", [LEGEND_X, LEGEND_Y_TOP - 0.5, "Lower (green)"], {
          fixed: true,
          fontSize: 14,
          color: COLORS.darkGreen,
          anchorX: "left",
        });

        const xAxis = board.defaultAxes.x;

        const gliderA = board.create("glider", [-2, 0, xAxis], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          size: 4,
          color: COLORS.blue,
          withLabel: false,
          name: "",
        });

        const gliderB = board.create("glider", [5, 0, xAxis], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          size: 4,
          color: COLORS.blue,
          withLabel: false,
          name: "",
        });


        const nSlider = board.create(
          "slider",
          [
            [3, -5],
            [6, -5],
            [1, 50, MAX_PARTITIONS],
          ],
          { name: "n", snapWidth: 1, precision: 0 }
        ) as JXG.Slider;

        const deltaSlider = board.create(
          "slider",
          [
            [3, -5.6],
            [6, -5.6],
            [0, 0.5, 3],
          ],
          { name: "δ", snapWidth: 0.05, precision: 2 }
        ) as JXG.Slider;

        // Random partition generator 

        const makeWeights = () =>
          Array.from({ length: MAX_PARTITIONS }, () => Math.random() * 0.8 + 0.3);

        let randomWeights = makeWeights();

        const buildRandomCuts = (n: number, start: number, end: number) => {
          const range = end - start;
          const m = Math.min(n, MAX_PARTITIONS);

          let totalWeight = 0;
          for (let i = 0; i < m; i++) totalWeight += randomWeights[i];

          const cuts: number[] = [start];
          let cum = 0;

          for (let i = 0; i < m; i++) {
            cum += randomWeights[i];
            cuts.push(start + range * (cum / totalWeight));
          }

          cuts[cuts.length - 1] = end;
          return cuts;
        };

        // -----------------------------
        // 6) Exact sup/inf on subintervals for this cubic
        // -----------------------------
        // For a cubic, maxima/minima on [x1,x2] occur at endpoints and at critical points.
        // f'(x) = 0.75x^2 - 2x - 1  => two critical points (roots of f').
        const criticalPoints = (() => {
          const A = 0.75,
            B = -2,
            C = -1;
          const D = B * B - 4 * A * C;
          const s = Math.sqrt(D);
          const r1 = (-B - s) / (2 * A);
          const r2 = (-B + s) / (2 * A);
          return [r1, r2].sort((u, v) => u - v);
        })();

        /* i am using this function multiple time throughout the applets */
        const extremaOnInterval = (x1: number, x2: number) => {
          let minVal = Math.min(f(x1), f(x2));
          let maxVal = Math.max(f(x1), f(x2));

          for (const c of criticalPoints) {
            if (c >= x1 - EPS && c <= x2 + EPS) {
              const v = f(c);
              minVal = Math.min(minVal, v);
              maxVal = Math.max(maxVal, v);
            }
          }
          return { min: minVal, max: maxVal };
        };

        const upperCurve = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.darkRed,
          strokeOpacity: 0.6,
          strokeWidth: 0.5,
          fillColor: COLORS.red,
          fillOpacity: 0.2,
          withLabel: false,
        });

        const lowerCurve = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.darkGreen,
          strokeOpacity: 0.6,
          strokeWidth: 0.5,
          fillColor: COLORS.green,
          fillOpacity: 0.3,
          withLabel: false,
        });

        const computeRectangleCurve = (cuts: number[], type: "upper" | "lower") => {
          const X: number[] = [];
          const Y: number[] = [];
          const delta = Math.max(0, deltaSlider.Value());

          for (let i = 0; i < cuts.length - 1; i++) {
            const x1 = cuts[i];
            const x2 = cuts[i + 1];
            const { min, max } = extremaOnInterval(x1, x2);

            const h = type === "upper" ? max + delta : min - delta;

            X.push(x1, x1, x2, x2);
            Y.push(0, h, h, 0);
          }

          return { X, Y };
        };


        const updateShapes = () => {
          board.suspendUpdate();

          const n = Math.max(1, Math.floor(nSlider.Value()));
          const a = gliderA.X();
          const b = gliderB.X();

          const start = Math.min(a, b);
          const end = Math.max(a, b);

          // If interval collapses, clear shapes
          if (end - start < EPS) {
            upperCurve.dataX = [];
            upperCurve.dataY = [];
            lowerCurve.dataX = [];
            lowerCurve.dataY = [];
            board.unsuspendUpdate();
            board.update();
            return;
          }

          // Partition depends on [a,b] so it changes continuously while dragging
          const cuts = buildRandomCuts(n, start, end);

          const up = computeRectangleCurve(cuts, "upper");
          const low = computeRectangleCurve(cuts, "lower");

          upperCurve.dataX = up.X;
          upperCurve.dataY = up.Y;

          lowerCurve.dataX = low.X;
          lowerCurve.dataY = low.Y;

          board.unsuspendUpdate();
          board.update();
        };


        const btnStyle =
          "padding: 4px; border-radius: 4px; cursor: pointer; user-select:none;";
        board.create(
          "button",
          [BTN_X, BTN_Y, "Randomize partition", () => {
            randomWeights = makeWeights();
            updateShapes();
          }],
          {
            cssStyle: `${btnStyle} color: #0D47A1; background-color: #E3F2FD;`,
            fixed: true,
          }
        );

        // -----------------------------
        // 10) Event listeners
        // -----------------------------
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const attach = (el: JXG.GeometryElement, ev: string) => el.on(ev as any, updateShapes);

        attach(nSlider, "drag");
        attach(nSlider, "down");
        attach(nSlider, "up");

        attach(deltaSlider, "drag");
        attach(deltaSlider, "down");
        attach(deltaSlider, "up");

        attach(gliderA, "drag");
        attach(gliderB, "drag");
        attach(gliderA, "up");
        attach(gliderB, "up");

        // Initial draw
        updateShapes();
      }}
    />
  );
}