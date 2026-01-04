import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS } from "../../utils/jsxgraph";

export default function UniformContinuitySequenceSinNxOverN() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-0.3, 1.05, 2 * Math.PI + 0.3, -1.05],
        axis: true,
        keepAspectRatio: false,
        showZoom: false,
        showNavigation: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        const TAU = 2 * Math.PI;

        const MAX_N = 200;
        const BACKGROUND_MAX = 60;

        // ---- sliders (same style as before)
        const nSlider = board.create(
          "slider",
          [
            [TAU - 2.15, -0.95],
            [TAU + 0.15, -0.95],
            [1, 10, MAX_N],
          ],
          { name: "n", snapWidth: 1, precision: 0 }
        ) as JXG.Slider;

        const epsSlider = board.create(
          "slider",
          [
            [0.25, -0.95],
            [2.05, -0.95],
            [0.01, 0.15, 0.6],
          ],
          { name: "ε", snapWidth: 0.005, precision: 3 }
        ) as JXG.Slider;

        const deltaSlider = board.create(
          "slider",
          [
            [2.35, -0.95],
            [4.15, -0.95],
            [0.01, 0.15, 1.0],
          ],
          { name: "δ", snapWidth: 0.005, precision: 3 }
        ) as JXG.Slider;

        // Minimal labels (keep it light)
        board.create("text", [0.1, 0.92, "f_n(x)=sin(nx)/n"], {
          fixed: true,
          fontSize: 18,
          color: COLORS.blue,
          anchorX: "left",
        });

        // ---- helper
        const fn = (x: number, n: number) => Math.sin(n * x) / n;

        // ---- dashed family of previous functions (visible iff k < n)
        const bgCurves: JXG.Curve[] = [];
        for (let k = 1; k <= BACKGROUND_MAX; k++) {
          const kk = k;
          const c = board.create("functiongraph", [(x: number) => fn(x, kk), 0, TAU], {
            strokeColor: COLORS.blue,
            strokeWidth: 2,
            dash: 2,
            opacity: 0.14,
            highlight: false,
            visible: kk < Math.floor(nSlider.Value()),
          }) as JXG.Curve;
          bgCurves.push(c);
        }

        // ---- current function (solid)
        const currentCurve = board.create(
          "functiongraph",
          [(x: number) => fn(x, Math.floor(nSlider.Value())), 0, TAU],
          {
            strokeColor: COLORS.blue,
            strokeWidth: 3,
            dash: 0,
            opacity: 1,
            highlight: false,
          }
        ) as JXG.Curve;

        // ---- x-axis segment for x, and δ-window segment for y
        const xAxis = board.create("segment", [[0, 0], [TAU, 0]], {
          visible: false,
          fixed: true,
          highlight: false,
        });

        const xPoint = board.create("glider", [1.0, 0, xAxis], {
          name: "x",
          size: 4,
          strokeColor: "#000",
          fillColor: "#000",
          label: { fontSize: 14, offset: [8, -12] },
        }) as JXG.Point;

        const clamp = (t: number) => Math.max(0, Math.min(TAU, t));

        // y is constrained to [x-δ, x+δ]
        const yWindow = board.create(
          "segment",
          [
            [() => clamp(xPoint.X() - deltaSlider.Value()), 0],
            [() => clamp(xPoint.X() + deltaSlider.Value()), 0],
          ],
          {
            strokeColor: "#666",
            strokeOpacity: 0.35,
            strokeWidth: 6,
            lineCap: "round",
            fixed: true,
            highlight: false,
          }
        ) as JXG.Segment;

        const yPoint = board.create("glider", [1.2, 0, yWindow], {
          name: "y",
          size: 4,
          strokeColor: "#000",
          fillColor: "#000",
          label: { fontSize: 14, offset: [8, -12] },
        }) as JXG.Point;

        // ---- points on the graph: P=(x, f_n(x)), Q=(y, f_n(y))
        const P = board.create(
          "point",
          [
            () => xPoint.X(),
            () => fn(xPoint.X(), Math.floor(nSlider.Value())),
          ],
          {
            name: "",
            size: 5,
            strokeColor: COLORS.blue,
            fillColor: COLORS.blue,
            fixed: true,
            highlight: false,
          }
        ) as JXG.Point;

        const Q = board.create(
          "point",
          [
            () => yPoint.X(),
            () => fn(yPoint.X(), Math.floor(nSlider.Value())),
          ],
          {
            name: "",
            size: 5,
            strokeColor: COLORS.orange,
            fillColor: COLORS.orange,
            fixed: true,
            highlight: false,
          }
        ) as JXG.Point;

        // ---- ε-neighborhood around f_n(x): y = f_n(x) ± ε  (dynamic)
        const epsUpper = board.create("line", [[0, 0], [1, 0]], {
          straightFirst: true,
          straightLast: true,
          fixed: true,
          strokeColor: COLORS.red,
          dash: 2,
          strokeOpacity: 0.45,
          strokeWidth: 2,
          highlight: false,
        }) as JXG.Line;

        const epsLower = board.create("line", [[0, 0], [1, 0]], {
          straightFirst: true,
          straightLast: true,
          fixed: true,
          strokeColor: COLORS.red,
          dash: 2,
          strokeOpacity: 0.45,
          strokeWidth: 2,
          highlight: false,
        }) as JXG.Line;

        // optional vertical segment showing |f_n(x)-f_n(y)|
        const diffSeg = board.create("segment", [P, Q], {
          strokeColor: "#444",
          strokeWidth: 4,
          strokeOpacity: 0.35,
          highlight: false,
        }) as JXG.Segment;

        // ---- performance: update only bg visibility deltas
        let prevN = Math.floor(nSlider.Value());

        function updateBackgroundVisibility(n: number) {
          const showUpTo = Math.min(BACKGROUND_MAX, n - 1);
          const prevShowUpTo = Math.min(BACKGROUND_MAX, prevN - 1);

          if (showUpTo === prevShowUpTo) return;

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

        function updateEpsTubeAndColors() {
          const n = Math.floor(nSlider.Value());
          const eps = epsSlider.Value();

          const fx = fn(xPoint.X(), n);
          const fy = fn(yPoint.X(), n);

          // ε-tube around f_n(x)
          epsUpper.point1.setPosition(JXG.COORDS_BY_USER, [0, fx + eps]);
          epsUpper.point2.setPosition(JXG.COORDS_BY_USER, [1, fx + eps]);
          epsLower.point1.setPosition(JXG.COORDS_BY_USER, [0, fx - eps]);
          epsLower.point2.setPosition(JXG.COORDS_BY_USER, [1, fx - eps]);

          // Condition for uniform continuity test at chosen x,y:
          const ok = Math.abs(fy - fx) < eps;

          Q.setAttribute({
            strokeColor: ok ? COLORS.green : COLORS.orange,
            fillColor: ok ? COLORS.green : COLORS.orange,
          });

          diffSeg.setAttribute({ strokeColor: ok ? COLORS.green : "#444", strokeOpacity: ok ? 0.55 : 0.35 });

          // Optionally color the whole current curve (nice feedback)
          currentCurve.setAttribute({ strokeColor: ok ? COLORS.green : COLORS.blue });
        }

        const update = () => {
          board.suspendUpdate();

          const n = Math.floor(nSlider.Value());
          updateBackgroundVisibility(n);
          prevN = n;

          // keep x,y inside [0,2π]
          xPoint.setPosition(JXG.COORDS_BY_USER, [clamp(xPoint.X()), 0]);
          yPoint.setPosition(JXG.COORDS_BY_USER, [clamp(yPoint.X()), 0]);

          updateEpsTubeAndColors();

          board.unsuspendUpdate();
          board.update();
        };

        nSlider.on("drag", update);
        nSlider.on("up", update);
        epsSlider.on("drag", update);
        epsSlider.on("up", update);
        deltaSlider.on("drag", update);
        deltaSlider.on("up", update);
        xPoint.on("drag", update);
        yPoint.on("drag", update);

        update();
      }}
    />
  );
}