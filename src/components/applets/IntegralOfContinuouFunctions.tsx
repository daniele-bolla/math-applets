import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import {
  COLORS,
  createFunctionGraph,
  createGlider,
  createPoint,
  createSegment,
  createSlider,
  createText,
  createCurve,
} from "../../utils/jsxgraph";

export default function IntegrabilityProofApplet() {
  return (
    <JSXGraphBoard
      config={{ boundingbox: [-1, 6, 9, -5], axis: true }}
      setup={(board: JXG.Board) => {
        const EPS = 1e-9;

        // ===== CONSTRAIN [a,b] TO THIS FIXED INTERVAL =====
        const DOMAIN_MIN = 0;
        const DOMAIN_MAX = 8;

        const f = (x: number) => 0.5 * Math.sin(x) * x + 2.5;

        createFunctionGraph(board, f, [DOMAIN_MIN, DOMAIN_MAX]);

        const nSlider = createSlider(
          board,
          [5, -3.5],
          [8, -3.5],
          [1, 50, 500],
          { name: "n", snapWidth: 1, precision: 0 }
        );

        const epsSlider = createSlider(
          board,
          [5, -2],
          [8, -2],
          [0.5, 2.0, 10.0],
          { name: "&epsilon;", snapWidth: 0.1 }
        );

        // Create a segment on the x-axis for constraining gliders
        const domainLeft = createPoint(
          board,
          [DOMAIN_MIN, 0],
          { visible: false, fixed: true },
          COLORS.black
        );
        const domainRight = createPoint(
          board,
          [DOMAIN_MAX, 0],
          { visible: false, fixed: true },
          COLORS.black
        );
        const domainSegment = createSegment(
          board,
          [domainLeft, domainRight],
          { visible: false, fixed: true },
          COLORS.black
        );

        // Gliders constrained to the domain segment
        const gliderA = createGlider(
          board,
          [1, 0, domainSegment],
          { name: "a" },
          COLORS.blue
        );

        const gliderB = createGlider(
          board,
          [6, 0, domainSegment],
          { name: "b" },
          COLORS.blue
        );


        const conditionLabel = createText(
          board,
          [0.5, -3.4],
          "",
          { fixed: true, fontSize: 12, anchorX: "left" },
          COLORS.green
        );

        const failureLabel = createText(
          board,
          [0.5, -4.1],
          "",
          { fixed: true, fontSize: 11, anchorX: "left" },
          COLORS.red
        );

        const upperStep = createCurve(board, [[0], [0]], {
          strokeWidth: 2,
          fillOpacity: 0,
          withLabel: false,
          layer: 7,
        }, COLORS.orange);

        const lowerStep = createCurve(board, [[0], [0]], {
          strokeWidth: 2,
          fillOpacity: 0,
          withLabel: false,
          layer: 7,
        }, "#800080");

        const bandPoly = createCurve(board, [[0], [0]], {
          strokeWidth: 0,
          fillOpacity: 0.42,
          withLabel: false,
          layer: 3,
        }, COLORS.green);

        const phiLines = createCurve(board, [[0], [0]], {
          strokeWidth: 0.5,
          strokeOpacity: 0.6,
          dash: 3,
          layer: 9,
        }, COLORS.orange);

        const psiLines = createCurve(board, [[0], [0]], {
          strokeWidth: 0.5,
          strokeOpacity: 0.6,
          dash: 3,
          layer: 9,
        }, "#800080");

        const labelPhi = createText(board, [0, 0], "&phi;", {
          anchorX: "left",
          fontSize: 16,
          fixed: true,
          layer: 10,
        }, COLORS.orange);

        const labelPsi = createText(board, [0, 0], "&psi;", {
          anchorX: "left",
          fontSize: 16,
          fixed: true,
          layer: 10,
        }, "#800080");

        let currentB = 6;
        let currentETilde = 0.2;

        const epsP1 = createPoint(
          board,
          [() => currentB, () => f(currentB) - currentETilde],
          { visible: false, fixed: true },
          COLORS.black
        );
        const epsP2 = createPoint(
          board,
          [() => currentB, () => f(currentB) + currentETilde],
          { visible: false, fixed: true },
          COLORS.black
        );

        const epsBracket = createSegment(board, [epsP1, epsP2], {
          layer: 10,
        }, COLORS.green);

        const epsBracketLabel = createText(
          board,
          [() => currentB + 0.25, () => f(currentB)],
          "2ε̃",
          { fixed: true, anchorX: "left", fontSize: 12, layer: 10 },
          COLORS.green
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

        const checkBoundsContainF = (
          cuts: number[],
          upperH: number[],
          lowerH: number[],
          samples: number = 20
        ): boolean => {
          const n = cuts.length - 1;
          for (let i = 1; i <= n; i++) {
            const left = cuts[i - 1];
            const right = cuts[i];
            for (let j = 0; j <= samples; j++) {
              const x = left + (j / samples) * (right - left);
              const y = f(x);
              if (y > upperH[i] + EPS || y < lowerH[i] - EPS) {
                return false;
              }
            }
          }
          return true;
        };

        let isUpdatingSlider = false;

        const update = (autoAdjustN: boolean = false) => {
          board.suspendUpdate();

          const aRaw = gliderA.X();
          const bRaw = gliderB.X();
          const a = Math.min(aRaw, bRaw);
          const b = Math.max(aRaw, bRaw);
          const range = b - a;

          currentB = b;

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
            failureLabel.setText("");
            board.unsuspendUpdate();
            board.update();
            return;
          }

          epsBracket.setAttribute({ visible: true });
          epsBracketLabel.setAttribute({ visible: true });

          const eps = epsSlider.Value();
          const eTilde = eps / (2 * range);
          currentETilde = eTilde;

          const maxAbsX = Math.max(Math.abs(a), Math.abs(b));
          const supDf = 0.5 * (1 + maxAbsX);
          const delta = eTilde / supDf;

          const minN = Math.ceil(range / delta) + 1;
          let n = Math.max(1, Math.floor(nSlider.Value()));

          if (autoAdjustN && !isUpdatingSlider) {
            isUpdatingSlider = true;
            const sliderMax = 500;
            const newN = Math.min(minN, sliderMax);
            nSlider.setValue(newN);
            n = newN;
            isUpdatingSlider = false;
          }

          const dx = range / n;
          const isConditionMet = dx < delta;

          const { cuts } = uniformPartition(a, b, n);

          const upperH = Array.from<number>({ length: n + 1 });
          const lowerH = Array.from<number>({ length: n + 1 });

          for (let i = 1; i <= n; i++) {
            const fx_i = f(cuts[i]);
            upperH[i] = fx_i + eTilde;
            lowerH[i] = fx_i - eTilde;
          }

          const boundsWork = checkBoundsContainF(cuts, upperH, lowerH);

          if (isConditionMet && boundsWork) {
            conditionLabel.setText(`(b-a)/n < δ ✓  (n = ${n} ≥ ${minN})`);
            conditionLabel.setAttribute({ color: COLORS.green });
            failureLabel.setText("");
            
            bandPoly.setAttribute({ fillColor: COLORS.green });
            epsBracket.setAttribute({ strokeColor: COLORS.green });
            epsBracketLabel.setAttribute({ color: COLORS.green });
            upperStep.setAttribute({ strokeColor: COLORS.orange });
            lowerStep.setAttribute({ strokeColor: "#800080" });
            phiLines.setAttribute({ strokeColor: COLORS.orange });
            psiLines.setAttribute({ strokeColor: "#800080" });
            labelPhi.setAttribute({ color: COLORS.orange });
            labelPsi.setAttribute({ color: "#800080" });
          } else {
            conditionLabel.setText(`(b-a)/n ≥ δ ✗  (n = ${n} < ${minN} required)`);
            conditionLabel.setAttribute({ color: COLORS.red });
            failureLabel.setText("⚠️ Bounds fail: ψ ≰ f or f ≰ φ on some intervals!");
            
            bandPoly.setAttribute({ fillColor: COLORS.red });
            epsBracket.setAttribute({ strokeColor: COLORS.red });
            epsBracketLabel.setAttribute({ color: COLORS.red });
            upperStep.setAttribute({ strokeColor: COLORS.red });
            lowerStep.setAttribute({ strokeColor: COLORS.red });
            phiLines.setAttribute({ strokeColor: COLORS.red });
            psiLines.setAttribute({ strokeColor: COLORS.red });
            labelPhi.setAttribute({ color: COLORS.red });
            labelPsi.setAttribute({ color: COLORS.red });
          }

          const up = stepPolyline(cuts, upperH);
          const low = stepPolyline(cuts, lowerH);

          upperStep.dataX = up.X;
          upperStep.dataY = up.Y;

          lowerStep.dataX = low.X;
          lowerStep.dataY = low.Y;

          const band = bandPolygon(cuts, upperH, lowerH);
          bandPoly.dataX = band.X;
          bandPoly.dataY = band.Y;

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

          labelPhi.setPosition(JXG.COORDS_BY_USER, [b + 0.12, upperH[n]]);
          labelPsi.setPosition(JXG.COORDS_BY_USER, [b + 0.12, lowerH[n]]);

          board.unsuspendUpdate();
          board.update();
        };

        epsSlider.on("drag", () => update(true));
        epsSlider.on("up", () => update(true));

        gliderA.on("drag", () => update(true));
        gliderB.on("drag", () => update(true));
        gliderA.on("up", () => update(true));
        gliderB.on("up", () => update(true));

        nSlider.on("drag", () => update(false));
        nSlider.on("up", () => update(false));

        update(true);
      }}
    />
  );
}