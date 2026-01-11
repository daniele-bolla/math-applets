import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
  COLORS,
  createSlider,
  createSegment,
  createGlider,
  createFunctionGraph,
  createPoint,
  createDashedSegment,
  DEFAULT_LINE_ATTRIBUTES
} from "../../utils/jsxgraph";

export default function UniformConvergenceSinNxOverN() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-0.3, 1.05, 2 * Math.PI + 0.3, -0.45],
        keepAspectRatio: false,
      }}
      setup={(board: JXG.Board) => {
        const TAU = 2 * Math.PI;

        const MAX_N = 300;
        const BACKGROUND_MAX = 100;

        // --- Sliders (same “bottom band” idea as your pointwise applet)
        const nSlider = createSlider(
          board,
          [TAU - 2.2, -0.20],
          [TAU - 0.2, -0.20],
          [1, 10, MAX_N],
          { name: "n", snapWidth: 1, precision: 0 }
        );

        const epsSlider = createSlider(
          board,
          [TAU - 2.2, -0.30],
          [TAU - 0.2, -0.30],
          [0.01, 0.08, 0.5],
          { name: "ε", snapWidth: 0.005, precision: 3 }
        );

        const fn = (x: number, n: number) => Math.sin(n * x) / n;
        const fLimit = (_x: number) => 0;

        // --- x glider on [0, 2π]
        const xSeg = createSegment(board, [[0, 0], [TAU, 0]], {
          visible: false,
          fixed: true,
          highlight: false,
        });

        const xPoint = createGlider(board, [1.0, 0, xSeg], {
          name: "x",
          label: { fontSize: 14, offset: [8, -12] },
        }, COLORS.red);

        // --- Background family: f_k(x) dashed, visible iff k < n
        const bgCurves: JXG.Curve[] = [];
        for (let k = 1; k <= BACKGROUND_MAX; k++) {
          const kk = k;
          const c = createFunctionGraph(board, (x: number) => fn(x, kk), [0, TAU], {
            strokeColor: COLORS.blue,
            strokeWidth: 2,
            dash: 2,
            opacity: 0.14,
            highlight: false,
            visible: kk < Math.floor(nSlider.Value()),
          });
          bgCurves.push(c);
        }

        // --- Current curve (solid)
        createFunctionGraph(
          board,
          (x: number) => fn(x, Math.floor(nSlider.Value())),
          [0, TAU],
          {
            strokeColor: COLORS.blue,
            strokeWidth: 3,
            opacity: 1,
            dash: 0,
            highlight: false,
          }
        );

        // --- Limit function f(x)=0 (red line)
        const zeroFunction = board.create("line", [[0, 0], [1, 0]], {
          ...DEFAULT_LINE_ATTRIBUTES,
          straightFirst: true,
          straightLast: true,
          fixed: true,
          strokeColor: COLORS.red,
          strokeWidth: 2,
          strokeOpacity: 0.85,
          highlight: false,
        }) as JXG.Line;

        // --- ε-tube around f(x)=0: y = ±ε
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
          strokeColor: "#666",
          dash: 1,
          strokeOpacity: 0.35,
        }) as JXG.Line;

        // Point P_n = (x, f_n(x))
        const Pn = createPoint(
          board,
          [
            () => xPoint.X(),
            () => fn(xPoint.X(), Math.floor(nSlider.Value())),
          ],
          {
            name: "",
            size: 5,
            fixed: true,
            strokeColor: COLORS.red,
            fillColor: COLORS.red,
            highlight: false,
          }
        );

        // Point on the limit function at the same x: (x, 0)
        const Qlim = createPoint(
          board,
          [() => xPoint.X(), () => fLimit(xPoint.X())],
          { visible: false, fixed: true, highlight: false }
        );

        // Error segment
        const errSeg = createDashedSegment(board, [Qlim, Pn], {
          strokeColor: COLORS.gray,
          strokeWidth: 2,
          strokeOpacity: 0.45,
          highlight: false,
        });

        // --- Performance: update only bg visibility changes
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
        }

        function updateDynamicLinesAndColor() {
          const x = xPoint.X();
          const eps = epsSlider.Value();
          const fx = fLimit(x); // =0

          // ε-tube around f(x)
          const yU = fx + eps;
          const yL = fx - eps;

          tubeUpper.point1.setPosition(JXG.COORDS_BY_USER, [0, yU]);
          tubeUpper.point2.setPosition(JXG.COORDS_BY_USER, [1, yU]);
          tubeLower.point1.setPosition(JXG.COORDS_BY_USER, [0, yL]);
          tubeLower.point2.setPosition(JXG.COORDS_BY_USER, [1, yL]);

          // vertical guide x = chosen x
          xGuide.point1.setPosition(JXG.COORDS_BY_USER, [x, -10]);
          xGuide.point2.setPosition(JXG.COORDS_BY_USER, [x, 10]);

          const n = Math.floor(nSlider.Value());
          const fnx = fn(x, n);

          // Pointwise-style local check (same as your pointwise applet)
          const ok = Math.abs(fnx - fx) < eps;

          Pn.setAttribute({
            strokeColor: ok ? COLORS.green : COLORS.red,
            fillColor: ok ? COLORS.green : COLORS.red,
          });
          
          xPoint.setAttribute({
            strokeColor: ok ? COLORS.green : COLORS.red,
            fillColor: ok ? COLORS.green : COLORS.red,
          });

          errSeg.setAttribute({
            strokeColor: ok ? COLORS.green : COLORS.red,
            strokeOpacity: ok ? 0.55 : 0.45,
          });

          // Uniform check: sup_x |sin(nx)/n| = 1/n
          const okUniform = 1 / n < eps;

          // currentCurve.setAttribute({ strokeColor: okUniform ? COLORS.green : COLORS.blue });

          tubeUpper.setAttribute({
            strokeColor: okUniform ? COLORS.green : COLORS.red,
            strokeOpacity: okUniform ? 0.55 : 0.45,
          });
          tubeLower.setAttribute({
            strokeColor: okUniform ? COLORS.green : COLORS.red,
            strokeOpacity: okUniform ? 0.55 : 0.45,
          });
          zeroFunction.setAttribute({
            strokeColor: okUniform ? COLORS.green : COLORS.red,
            strokeOpacity: okUniform ? 0.55 : 0.45,
          });
        }

        const update = () => {
          board.suspendUpdate();

          const n = Math.floor(nSlider.Value());
          updateBackgroundVisibility(n);
          prevN = n;

          // keep x in [0,2π]
          const xx = Math.max(0, Math.min(TAU, xPoint.X()));
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