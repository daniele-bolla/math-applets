import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
  COLORS,
  DEFAULT_FUNCTION_GRAPH_ATTRIBUTES,
  DEFAULT_GLIDER_ATTRIBUTES,
} from "../../utils/jsxgraph";

export default function IntegrabilityProofApplet() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-1, 6, 9, -5], axis: true }}
      setup={(board: JXG.Board) => {
        const EPS = 1e-9;

        // ============================================================
        // STEP 0: Choose a continuous function f and draw it.
        // ============================================================
        const f = (x: number) => 0.5 * Math.sin(x) * x + 2.5;

        board.create("functiongraph", [f, -10, 10], {
          ...DEFAULT_FUNCTION_GRAPH_ATTRIBUTES,
        });

        // ============================================================
        // STEP 0: Controls (ε, n, interval endpoints a,b)
        // ============================================================
        const epsSlider = board.create(
          "slider",
          [
            [5, -2],
            [8, -2],
            [0.1, 1.5, 5.0],
          ],
          { name: "&epsilon;", snapWidth: 0.1 }
        ) as JXG.Slider;

        const nSlider = board.create(
          "slider",
          [
            [5, -3.5],
            [8, -3.5],
            [1, 10, 200],
          ],
          { name: "n", snapWidth: 1, precision: 0 }
        ) as JXG.Slider;

        const gliderA = board.create("glider", [1, 0, board.defaultAxes.x], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "a",
          color: COLORS.blue,
        });

        const gliderB = board.create("glider", [6, 0, board.defaultAxes.x], {
          ...DEFAULT_GLIDER_ATTRIBUTES,
          name: "b",
          color: COLORS.blue,
        });

        // ============================================================
        // Graphics objects
        // ============================================================
        const upperStep = board.create("curve", [[0], [0]], {
          strokeWidth: 2,
          strokeColor: COLORS.orange,
          fillOpacity: 0,
          withLabel: false,
          layer: 7,
        });

        const lowerStep = board.create("curve", [[0], [0]], {
          strokeWidth: 2,
          strokeColor: "#800080",
          fillOpacity: 0,
          withLabel: false,
          layer: 7,
        });

        const bandPoly = board.create("curve", [[0], [0]], {
          strokeWidth: 0,
          fillOpacity: 0.42,
          fillColor: COLORS.green,
          withLabel: false,
          layer: 3,
        });

        // Partition lines (orange for φ, purple for ψ)
        const phiLines = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.orange,
          strokeWidth: .5,
          strokeOpacity: 0.6,
          dash: 3,
          layer: 9,
        });

        const psiLines = board.create("curve", [[0], [0]], {
          strokeColor: "#800080",
          strokeWidth: .5,
          strokeOpacity: 0.6,
          dash: 3,
          layer: 9,
        });

        const labelPhi = board.create("text", [0, 0, "&phi;"], {
          color: COLORS.orange,
          anchorX: "left",
          fontSize: 16,
          fixed: true,
          layer: 10,
        });

        const labelPsi = board.create("text", [0, 0, "&psi;"], {
          color: "#800080",
          anchorX: "left",
          fontSize: 16,
          fixed: true,
          layer: 10,
        });

        // ============================================================
        // ε~-bracket at x=b (length 2ε~)
        // ============================================================
        let currentB = 6;
        let currentETilde = 0.2;
        let deltaCopndition = true; // updated in update()

        const epsP1 = board.create(
          "point",
          [() => currentB, () => f(currentB) - currentETilde],
          { visible: false, fixed: true }
        );
        const epsP2 = board.create(
          "point",
          [() => currentB, () => f(currentB) + currentETilde],
          { visible: false, fixed: true }
        );

        const epsBracket = board.create("segment", [epsP1, epsP2], {
          strokeColor: COLORS.green,
          strokeWidth: 2,
          dash: 2,
          fixed: true,
          highlight: false,
          layer: 10,
        });

        const epsBracketLabel = board.create(
          "text",
          [
            () => currentB + 0.45,
            () => f(currentB),
            () =>
              `2ε~ (${
                deltaCopndition ? "(b-a)/n < δ" : "(b-a)/n ≥ δ"
              })`,
          ],
          { fixed: true, anchorX: "left", fontSize: 12, color: COLORS.green, layer: 10 }
        );


        const uniformPartition = (a: number, b: number, n: number) => {
          const dx = (b - a) / n;
          const cuts = Array.from({ length: n + 1 }, (_, k) => a + k * dx);
          cuts[cuts.length - 1] = b;
          return { cuts, dx };
        };

        const stepPolyline = (cuts: number[], heights: number[]) => {
          const n = cuts.length - 1;
          const X: number[] = [];
          const Y: number[] = [];

          X.push(cuts[0]);
          Y.push(heights[1]);

          for (let i = 1; i <= n; i++) {
            X.push(cuts[i]);
            Y.push(heights[i]);
            if (i < n) {
              X.push(cuts[i]);
              Y.push(heights[i + 1]);
            }
          }
          return { X, Y };
        };

        const bandPolygon = (cuts: number[], upperH: number[], lowerH: number[]) => {
          const n = cuts.length - 1;
          const X: number[] = [];
          const Y: number[] = [];

          for (let i = 1; i <= n; i++) {
            X.push(cuts[i - 1], cuts[i]);
            Y.push(upperH[i], upperH[i]);
          }
          for (let i = n; i >= 1; i--) {
            X.push(cuts[i], cuts[i - 1]);
            Y.push(lowerH[i], lowerH[i]);
          }
          return { X, Y };
        };

        const update = () => {
          board.suspendUpdate();

          // STEP 1: read ε, n, [a,b]
          const n = Math.max(1, Math.floor(nSlider.Value()));
          const aRaw = gliderA.X();
          const bRaw = gliderB.X();
          const a = Math.min(aRaw, bRaw);
          const b = Math.max(aRaw, bRaw);
          const range = b - a;

          currentB = b;
          // If invalid interval, clear and exit
          if (range < EPS) {
            upperStep.dataX = [];
            upperStep.dataY = [];
            lowerStep.dataX = [];
            lowerStep.dataY = [];
            bandPoly.dataX = [];
            bandPoly.dataY = [];
            phiLines.dataX = [];
            phiLines.dataY = [];
            psiLines.dataX = [];
            psiLines.dataY = [];

            epsBracket.setAttribute({ visible: false });
            epsBracketLabel.setAttribute({ visible: false });

            board.unsuspendUpdate();
            board.update();
            return;
          }

          epsBracket.setAttribute({ visible: true });
          epsBracketLabel.setAttribute({ visible: true });

          const eps = epsSlider.Value();

          // STEP 2: ε~ = ε/(2(b-a))
          const eTilde = eps / (2 * range);
          currentETilde = eTilde;

          // STEP 3: uniform partition Z with dx=(b-a)/n
          const { cuts, dx } = uniformPartition(a, b, n);

          // STEP 4: rigorous δ ensuring (7.2)
          const maxAbsX = Math.max(Math.abs(a), Math.abs(b));
          const supDf = 0.5 * (1 + maxAbsX);
          const delta = eTilde / supDf;

          // Proof condition: dx < δ
          deltaCopndition = dx < delta;

          // Color feedback (band + bracket + label)
          const okColor = deltaCopndition ? COLORS.green : COLORS.red;
          bandPoly.setAttribute({ fillColor: okColor });
          epsBracket.setAttribute({ strokeColor: okColor });
          epsBracketLabel.setAttribute({ color: okColor });

          // STEP 5: define ψ and φ on each open interval using right endpoint x_i
          const upperH = Array.from<number>({ length: n + 1 });
          const lowerH = Array.from<number>({ length: n + 1 });

          for (let i = 1; i <= n; i++) {
            const fx_i = f(cuts[i]);
            upperH[i] = fx_i + eTilde;
            lowerH[i] = fx_i - eTilde;
          }

          // STEP 6: draw φ, ψ and the band
          const up = stepPolyline(cuts, upperH);
          const low = stepPolyline(cuts, lowerH);

          upperStep.dataX = up.X;
          upperStep.dataY = up.Y;

          lowerStep.dataX = low.X;
          lowerStep.dataY = low.Y;

          const band = bandPolygon(cuts, upperH, lowerH);
          bandPoly.dataX = band.X;
          bandPoly.dataY = band.Y;

          // STEP 7: colored dashed lines at partition points
          const xPhi: number[] = [];
          const yPhi: number[] = [];
          const xPsi: number[] = [];
          const yPsi: number[] = [];

          for (let i = 0; i <= n; i++) {
            const x = cuts[i];
            const j = i === 0 ? 1 : i;

            xPhi.push(x, x, NaN);
            yPhi.push(0, upperH[j], NaN);

            xPsi.push(x, x, NaN);
            yPsi.push(0, lowerH[j], NaN);
          }

          phiLines.dataX = xPhi;
          phiLines.dataY = yPhi;
          psiLines.dataX = xPsi;
          psiLines.dataY = yPsi;

          // Labels near right end
          labelPhi.setPosition(JXG.COORDS_BY_USER, [b + 0.12, upperH[n]]);
          labelPsi.setPosition(JXG.COORDS_BY_USER, [b + 0.12, lowerH[n]]);


          board.unsuspendUpdate();
          board.update();
        };

        // Event listeners
        gliderA.on("drag", update);
        gliderB.on("drag", update);
        gliderA.on("up", update);
        gliderB.on("up", update);

        epsSlider.on("drag", update);
        epsSlider.on("up", update);

        nSlider.on("drag", update);
        nSlider.on("up", update);

        update();
      }}
    />
  );
}