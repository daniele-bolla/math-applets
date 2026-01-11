import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
  COLORS,
  createSlider,
  createSegment,
  createGlider,
  createFunctionGraph,
  createLine,
  createPoint,
  createDashedSegment,
  createText,
  DEFAULT_LINE_ATTRIBUTES
} from "../../utils/jsxgraph";

export default function PointwiseConvergenceXn() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-0., 1.15, 1.1, -0.45],
      }}
      setup={(board: JXG.Board) => {
        const MAX_N = 300;
        const BACKGROUND_MAX = 100;
        const LABEL_MAX = 5;

        // --- Sliders
        const nSlider = createSlider(
          board,
          [0.5, -0.2],
          [1, -0.2],
          [1, 10, MAX_N],
          { name: "n", snapWidth: 1, precision: 0 }
        );

        const epsSlider = createSlider(
          board,
          [0.5, -0.3],
          [1, -0.3],
          [0.01, 0.08, 0.25],
          { name: "ε", snapWidth: 0.005, precision: 3 }
        );

        // board.create("text", [0.02, 1.06, "f_n(x)=x^n"], {
        //   fixed: true,
        //   fontSize: 18,
        //   color: COLORS.blue,
        //   anchorX: "left",
        // });

        // board.create("text", [0.02, 0.98, "f(x)"], {
        //   fixed: true,
        //   fontSize: 18,
        //   color: COLORS.red,
        //   anchorX: "left",
        // });

        const xSeg = createSegment(board, [[0, 0], [1, 0]], {
          visible: false,
          fixed: true,
          highlight: false,
        });

        const xPoint = createGlider(board, [0.7, 0, xSeg], {
          name: "x",
          fixed: false,
          label: { fontSize: 14, offset: [8, -12] },
        }, COLORS.red);

        const bgCurves: JXG.Curve[] = [];
        for (let k = 1; k <= BACKGROUND_MAX; k++) {
          const kk = k;
          const c = createFunctionGraph(board, (x: number) => Math.pow(x, kk), [0, 1], {
            strokeColor: COLORS.blue,
            strokeWidth: 2,
            dash: 2,
            opacity: 0.14,
            highlight: false,
            visible: kk < Math.floor(nSlider.Value()),
          });
          bgCurves.push(c);
        }

        // Labels for first few background curves (x^1..x^5)
        const labelX = 0.86;
        const curveLabels: JXG.Text[] = [];
        for (let k = 1; k <= LABEL_MAX; k++) {
          const kk = k;
          const t = createText(
            board,
            [() => labelX + 0.01, () => Math.pow(labelX, kk) + 0.02],
            () => `x^{${kk}}`,
            {
              fontSize: 14,
              color: COLORS.blue,
              visible: false,
              fixed: true,
              anchorX: "left",
            }
          );
          curveLabels.push(t);
        }

        // --- Current curve (solid)
        createFunctionGraph(
          board,
          (x: number) => Math.pow(x, Math.floor(nSlider.Value())),
          [0, 1],
          {
            strokeColor: COLORS.blue,
            strokeWidth: 3,
            opacity: 1,
            dash: 0,
            highlight: false,
          }
        );

        // --- Pointwise limit function for x^n on [0,1]:
        // f(x)=0 for x in [0,1), and f(1)=1.
        function fLimit(x: number) {
          return Math.abs(x - 1) < 1e-6 ? 1 : 0;
        }

        // Draw y=0 as a full red line (dominant part of the limit)
        const zeroFunction = board.create("line", [[0, 0], [1, 0]], {
          ...DEFAULT_LINE_ATTRIBUTES,
          straightFirst: true,
          straightLast: true,
          fixed: true,
          strokeColor: COLORS.red,
          strokeWidth: 2,
          strokeOpacity: 0.85,
          highlight: false,
        });

        // Special limit value at x=1
        createPoint(board, [1, 1], {
          name: "",
          size: 5,
          strokeColor: COLORS.red,
          fillColor: COLORS.red,
          fixed: true,
          highlight: false,
        });

        // --- ε-tube around f(x): y = f(x) ± ε
        const tubeUpper = board.create("line", [[0, 0], [1, 0]], {
          ...DEFAULT_LINE_ATTRIBUTES,
          straightFirst: true,
          straightLast: true,
          fixed: true,
          strokeColor: COLORS.red,
          dash: 2,
          strokeOpacity: 0.45,
          strokeWidth: 2,
          highlight: false,
        }) as JXG.Line;

        const tubeLower = board.create("line", [[0, 0], [1, 0]], {
          ...DEFAULT_LINE_ATTRIBUTES,
          straightFirst: true,
          straightLast: true,
          fixed: true,
          strokeColor: COLORS.red,
          dash: 2,
          strokeOpacity: 0.45,
          strokeWidth: 2,
          highlight: false,
        }) as JXG.Line;

        // Vertical guide at the chosen x
        const xGuide = board.create("line", [[0, 0], [0, 1]], {
          ...DEFAULT_LINE_ATTRIBUTES,
          straightFirst: true,
          straightLast: true,
          fixed: true,
          strokeColor: "#666",
          dash: 1,
          strokeOpacity: 0.35,
          strokeWidth: 1,
          highlight: false,
        }) as JXG.Line;

        // Point P_n = (x, x^n)
        const Pn = createPoint(
          board,
          [() => xPoint.X(), () => Math.pow(xPoint.X(), Math.floor(nSlider.Value()))],
          {
            name: "",
            size: 5,
            fixed: true,
            strokeColor: COLORS.red,
            fillColor: COLORS.red,
            highlight: false,
          }
        );

        const Qlim = createPoint(
          board,
          [() => xPoint.X(), () => fLimit(xPoint.X())],
          { visible: false, fixed: true, highlight: false }
        );

        const errSeg = createDashedSegment(board, [Qlim, Pn], {
          strokeColor: COLORS.gray,
          strokeWidth: 2,
          strokeOpacity: 0.45,
          highlight: false,
        });

        // // Display N_{x,ε}
        // board.create(
        //   "text",
        //   [
        //     0.02,
        //     0.90,
        //     () => {
        //       const x = xPoint.X();
        //       const eps = epsSlider.Value();
        //       const fx = fLimit(x);

        //       // For x=1: f_n(1)=1 for all n so |f_n(1)-f(1)|=0; any n works
        //       if (Math.abs(x - 1) < 1e-6) return "N_{x,ε}=1";

        //       // For x in [0,1): need x^n < eps
        //       if (x <= 0) return "N_{x,ε}=1";

        //       // Solve x^n < eps  =>  n > log(eps)/log(x)  (log(x)<0)
        //       const Nreq = Math.max(1, Math.ceil(Math.log(eps) / Math.log(x)));
        //       return `N_{x,ε}=${Nreq}`;
        //     },
        //   ],
        //   { fixed: true, fontSize: 16, color: "#000", anchorX: "left" }
        // );

        // // --- Performance: update only background visibility changes
        let prevN = Math.floor(nSlider.Value());

        function updateBackgroundVisibility(n: number) {
          const showUpTo = Math.min(BACKGROUND_MAX, n - 1);
          const prevShowUpTo = Math.min(BACKGROUND_MAX, prevN - 1);

          if (showUpTo !== prevShowUpTo) {
            if (showUpTo > prevShowUpTo) {
              for (let k = prevShowUpTo + 1; k <= showUpTo; k++) {
                if (k >= 1) bgCurves[k - 1].setAttribute({ visible: true });
              }
            } else {
              for (let k = showUpTo + 1; k <= prevShowUpTo; k++) {
                if (k >= 1) bgCurves[k - 1].setAttribute({ visible: false });
              }
            }
          }

          for (let k = 1; k <= LABEL_MAX; k++) {
            curveLabels[k - 1].setAttribute({ visible: k < n });
          }
        }

        function updateDynamicLinesAndColor() {
          const x = xPoint.X();
          const eps = epsSlider.Value();
          const fx = fLimit(x);

          // ε-tube around f(x)
          const yU = fx + eps;
          const yL = fx - eps;

          tubeUpper.point1.setPosition(JXG.COORDS_BY_USER, [0, yU]);
          tubeUpper.point2.setPosition(JXG.COORDS_BY_USER, [1, yU]);
          tubeLower.point1.setPosition(JXG.COORDS_BY_USER, [0, yL]);
          tubeLower.point2.setPosition(JXG.COORDS_BY_USER, [1, yL]);

          // vertical guide x = chosen x
          xGuide.point1.setPosition(JXG.COORDS_BY_USER, [x, 0]);
          xGuide.point2.setPosition(JXG.COORDS_BY_USER, [x, 1]);

          const n = Math.floor(nSlider.Value());
          const fnx = Math.pow(x, n);
          const ok = Math.abs(fnx - fx) < eps;

          Pn.setAttribute({
            strokeColor: ok ? COLORS.green : COLORS.red,
            fillColor: ok ? COLORS.green : COLORS.red,
          });
          xPoint.setAttribute({
            strokeColor: ok ? COLORS.green : COLORS.red,
            fillColor: ok ? COLORS.green : COLORS.red,
          });
          tubeUpper.setAttribute({
            strokeColor: ok ? COLORS.green : COLORS.red,
            strokeOpacity: ok ? 0.55 : 0.45,
          });
          tubeLower.setAttribute({
            strokeColor: ok ? COLORS.green : COLORS.red,
            strokeOpacity: ok ? 0.55 : 0.45,
          });
          zeroFunction.setAttribute({
            strokeColor: ok && xPoint.X() < 1? COLORS.green : COLORS.red,
            strokeOpacity: ok ? 0.55 : 0.45,
          });
          // also color error segment
          errSeg.setAttribute({
            strokeColor: ok ? COLORS.green : COLORS.red,
            strokeOpacity: ok ? 0.55 : 0.45,
          });
        }


        const update = () => {
          board.suspendUpdate();

          const n = Math.floor(nSlider.Value());
          updateBackgroundVisibility(n);
          prevN = n;

          // keep x strictly in [0,1]
          const xx = Math.max(0, Math.min(1, xPoint.X()));
          xPoint.setPosition(JXG.COORDS_BY_USER, [xx, 0]);

          updateDynamicLinesAndColor();

          board.unsuspendUpdate();
          board.update();
        };

        nSlider.on("drag", update);
        nSlider.on("up", update);
        epsSlider.on("drag", update);
        epsSlider.on("up", update);
        xPoint.on("drag", update);
        xPoint.on("up", update);

        update();
      }}
    />
  );
}