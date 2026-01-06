import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS } from "../../utils/jsxgraph";

export default function LeibnizAlternatingSeries() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1, 1.25, 22, -0.65],
        axis: true,
        keepAspectRatio: false,
        showZoom: false,
        showNavigation: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        const MAX_N = 120;   // was 200
        const X_SCALE = 10;  // keep as is  
        const x = (n: number) => n / X_SCALE;

        // --- Sliders (bottom-right)
        const nSlider = board.create(
          "slider",
          [
            [10, -0.6],
            [19, -0.6],
            [0, 30, MAX_N],
          ],
          { name: "N", snapWidth: 1, precision: 0 }
        ) as JXG.Slider;

        const pSlider = board.create(
          "slider",
          [
            [10, -0.4],
            [19, -0.4],
            [0.2, 1.0, 2.5],
          ],
          { name: "p", snapWidth: 0.01, precision: 2 }
        ) as JXG.Slider;

        board.create("text", [0.2, 1.10, "a_n"], {
          fixed: true,
          fontSize: 18,
          color: COLORS.green,
          anchorX: "left",
        });

        board.create("text", [0.2, 1.00, "s_{2m}"], {
          fixed: true,
          fontSize: 18,
          color: COLORS.red,
          anchorX: "left",
        });

        board.create("text", [0.2, 0.90, "s_{2m+1}"], {
          fixed: true,
          fontSize: 18,
          color: COLORS.blue,
          anchorX: "left",
        });

        board.create("line", [[0, 0], [1, 0]], {
          straightFirst: true,
          straightLast: true,
          fixed: true,
          strokeColor: "#777",
          strokeOpacity: 0.35,
          strokeWidth: 2,
          dash: 2,
          highlight: false,
        });

        const aPts: JXG.Point[] = [];
        const sPts: JXG.Point[] = [];

        for (let n = 0; n <= MAX_N; n++) {
          aPts.push(
            board.create("point", [0, 0], {
              name: "",
              size: 1,
              strokeColor: COLORS.green,
              fillColor: COLORS.green,
              fixed: true,
              visible: false,
              highlight: false,
            })
          );

          sPts.push(
            board.create("point", [0, 0], {
              name: "",
              size: 1,
              fixed: true,
              visible: false,
              highlight: false,
            })
          );
        }

        // --- Curves
        const aCurve = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.green,
          strokeWidth: 2,
          dash: 2,
          strokeOpacity: 0.8,
          highlight: false,
        }) as JXG.Curve;

        const evenCurve = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.red,
          strokeWidth: 2,
          dash: 2,
          highlight: false,
        }) as JXG.Curve;

        const oddCurve = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.blue,
          strokeWidth: 2,
          dash: 2,
          highlight: false,
        }) as JXG.Curve;

        // --- Markers
        const evenMarker = board.create("point", [0, 0], {
          name: "",
          size: 5,
          strokeColor: COLORS.red,
          fillColor: COLORS.red,
          fixed: true,
          highlight: false,
        });

        const oddMarker = board.create("point", [0, 0], {
          name: "",
          size: 5,
          strokeColor: COLORS.blue,
          fillColor: COLORS.blue,
          fixed: true,
          highlight: false,
        });

        // --- Bound lines
        const upperLine = board.create("line", [[0, 0], [1, 0]], {
          straightFirst: true,
          straightLast: true,
          strokeColor: COLORS.red,
          dash: 3,
          strokeWidth: 2,
          strokeOpacity: 0.5,
          fixed: true,
          highlight: false,
        }) as JXG.Line;

        const lowerLine = board.create("line", [[0, 0], [1, 0]], {
          straightFirst: true,
          straightLast: true,
          strokeColor: COLORS.blue,
          dash: 3,
          strokeWidth: 2,
          strokeOpacity: 0.5,
          fixed: true,
          highlight: false,
        }) as JXG.Line;

        // --- Gap segment
        const gapSeg = board.create("segment", [[0, 0], [0, 0]], {
          strokeColor: COLORS.gray,
          strokeWidth: 2,
          strokeOpacity: 0.55,
          dashed: 2,
          fixed: true,
          highlight: false,
        }) as JXG.Segment;

        function a(n: number, p: number) {
          return 1 / Math.pow(n + 1, p);
          //return 1 /(2*n + 1);
        }

        function computeArrays(p: number) {
          const A: number[] = Array.from({ length: MAX_N + 1 });
          const S: number[] = Array.from({ length: MAX_N + 1 });
          let s = 0;

          for (let n = 0; n <= MAX_N; n++) {
            const an = a(n, p);
            A[n] = an;
            s += (n % 2 === 0 ? 1 : -1) * an;
            S[n] = s;
          }
          return { A, S };
        }

        // Cache when p changes
        let cachedP = NaN;
        let cachedA: number[] = [];
        let cachedS: number[] = [];

        function update() {
          board.suspendUpdate();

          const N = Math.min(MAX_N, Math.floor(nSlider.Value()));
          const p = pSlider.Value();

          if (p !== cachedP) {
            const { A, S } = computeArrays(p);
            cachedA = A;
            cachedS = S;
            cachedP = p;
          }

          const Xa: number[] = [];
          const Ya: number[] = [];
          const Xe: number[] = [];
          const Ye: number[] = [];
          const Xo: number[] = [];
          const Yo: number[] = [];

          for (let n = 0; n <= MAX_N; n++) {
            const vis = n <= N;

            aPts[n].setAttribute({ visible: vis });
            sPts[n].setAttribute({ visible: vis });

            if (vis) {
              aPts[n].setPosition(JXG.COORDS_BY_USER, [x(n), cachedA[n]]);
              Xa.push(x(n));
              Ya.push(cachedA[n]);

              const col = n % 2 === 0 ? COLORS.red : COLORS.blue;
              sPts[n].setAttribute({ strokeColor: col, fillColor: col });
              sPts[n].setPosition(JXG.COORDS_BY_USER, [x(n), cachedS[n]]);

              if (n % 2 === 0) {
                Xe.push(x(n));
                Ye.push(cachedS[n]);
              } else {
                Xo.push(x(n));
                Yo.push(cachedS[n]);
              }
            }
          }

          aCurve.dataX = Xa;
          aCurve.dataY = Ya;
          evenCurve.dataX = Xe;
          evenCurve.dataY = Ye;
          oddCurve.dataX = Xo;
          oddCurve.dataY = Yo;

          const e = N % 2 === 0 ? N : N - 1;
          const o = N >= 1 ? (N % 2 === 1 ? N : N - 1) : 0;

          evenMarker.setPosition(JXG.COORDS_BY_USER, [x(e), cachedS[e]]);
          oddMarker.setPosition(JXG.COORDS_BY_USER, [x(o), cachedS[o]]);

          const upperY = cachedS[e];
          const lowerY = cachedS[o];

          upperLine.point1.setPosition(JXG.COORDS_BY_USER, [0, upperY]);
          upperLine.point2.setPosition(JXG.COORDS_BY_USER, [1, upperY]);
          lowerLine.point1.setPosition(JXG.COORDS_BY_USER, [0, lowerY]);
          lowerLine.point2.setPosition(JXG.COORDS_BY_USER, [1, lowerY]);

          const xGap = x(e);
          gapSeg.point1.setPosition(JXG.COORDS_BY_USER, [xGap, lowerY]);
          gapSeg.point2.setPosition(JXG.COORDS_BY_USER, [xGap, upperY]);

          board.unsuspendUpdate();
          board.update();
        }

        nSlider.on("drag", update);
        nSlider.on("up", update);
        pSlider.on("drag", update);
        pSlider.on("up", update);

        update();
      }}
    />
  );
}