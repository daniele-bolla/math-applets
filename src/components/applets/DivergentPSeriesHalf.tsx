import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS } from "../../utils/jsxgraph";

export default function DivergentPSeriesHalf() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-60, 4, 400, -4],
        axis: true,
        showZoom: false,
        showNavigation: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        const MAX_N = 300;
        const STEP = 10;

        // ---- Precompute a_n and s_n
        const A: number[] = new Array(MAX_N + 1);
        const S: number[] = new Array(MAX_N + 1);

        let partial = 0;
        for (let n = 0; n <= MAX_N; n++) {
          const an = 1 / Math.cbrt(n + 1); // (n+1)^(-1/3)
          partial += an;
          A[n] = an;
          S[n] = partial;
        }

        // Slider
        const nSlider = board.create(
          "slider",
          [
            [100, -200],
            [300, -200],
            [0, 0, MAX_N],
          ],
          { name: "N", snapWidth: 1, precision: 0 }
        ) as JXG.Slider;

        // Labels
        board.create("text", [2, -40, "a_n"], {
          fixed: true,
          fontSize: 18,
          color: COLORS.blue,
          anchorX: "left",
        });

        board.create("text", [2, 40, "s_n"], {
          fixed: true,
          fontSize: 18,
          color: COLORS.red,
          anchorX: "left",
        });

        // Sequence model: f(x)=1/(x+1)^(1/3)
        board.create(
          "functiongraph",
          [(x: number) => 1 / Math.cbrt(x + 1), 0, MAX_N*2],
          {
            strokeColor: COLORS.blue,
            strokeWidth: 2,
            dash:3,
            opacity: 0.6,
            highlight: false,
          }
        );

        // Partial sum growth model (integral):
        // g(x) = ∫_0^x (t+1)^(-1/3) dt = (3/2)*((x+1)^(2/3)-1)
        board.create(
          "functiongraph",
          [(x: number) => 1.5 * (Math.pow(x + 1, 2 / 3) - 1), 0, MAX_N*2],
          {
            strokeColor: COLORS.red,
            strokeWidth: 2,
            dash: 3,
            opacity: 0.6,
            highlight: false,
          }
        );

        // Points (shown only up to N)
        const termPts: JXG.Point[] = [];
        const sumPts: JXG.Point[] = [];

        for (let n = 0; n <= MAX_N; n++) {
          termPts.push(
            board.create("point", [n, A[n]], {
              name: "",
              size: 1,
              strokeColor: COLORS.blue,
              fillColor: COLORS.blue,
              fixed: true,
              visible: false,
              highlight: false,
            })
          );

          sumPts.push(
            board.create("point", [n, S[n]], {
              name: "",
              size: 1,
              strokeColor: COLORS.red,
              fillColor: COLORS.red,
              fixed: true,
              visible: false,
              highlight: false,
            })
          );
        }

        // Moving markers at current N
        const termMarker = board.create("point", [0, 0], {
          name: "",
          size: 5,
          strokeColor: COLORS.blue,
          fillColor: COLORS.blue,
          fixed: true,
          highlight: false,
        });

        const sumMarker = board.create("point", [0, 0], {
          name: "",
          size: 5,
          strokeColor: COLORS.red,
          fillColor: COLORS.red,
          fixed: true,
          highlight: false,
        });

        function update() {
          const N = Math.max(0, Math.min(MAX_N, Math.floor(nSlider.Value())));

          for (let n = 0; n <= MAX_N; n+= STEP) {
            const vis = n <= N;
            termPts[n].setAttribute({ visible: vis });
            sumPts[n].setAttribute({ visible: vis });
          }

          termMarker.setPosition(JXG.COORDS_BY_USER, [N, A[N]]);
          sumMarker.setPosition(JXG.COORDS_BY_USER, [N, S[N]]);
        }

        nSlider.on("drag", update);
        nSlider.on("up", update);

        update();
      }}
    />
  );
}