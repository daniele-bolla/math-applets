import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS, createText, createPoint, createSlider } from "../../utils/jsxgraph";

export default function ComplexRootsOfUnity() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1.6, 1.6, 2.1, -1.6],
        axis: true,
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        const TAU = 2 * Math.PI;
        const MAX_N = 24;

        // ----- Axis labels
        createText(board, [1.55, 0.15], "Re(z)", {
          fontSize: 18,
          fixed: true,
          anchorX: "left",
        });
        createText(board, [-0.2, 1.35], "Im(z)", {
          fontSize: 18,
          fixed: true,
          anchorX: "left",
        });

        // ----- Slider (BOTTOM-RIGHT)
        const nSlider = createSlider(
          board,
          [0.6, -1.35],
          [1.6, -1.35],
          [2, 6, MAX_N], // min=2 avoids division by 0/1
          { name: "n", snapWidth: 1 }
        ) as JXG.Slider;

        // ----- Base points and unit circle
        const O = createPoint(board, [0, 0], {
          name: "",
          fixed: true,
          highlight: false,
        });

        const One = createPoint(board, [1, 0], {
          name: "1",
          fixed: true,
          label: { offset: [6, -12], fontSize: 14 },
          highlight: false,
        });

        board.create("circle", [O, One], {
          strokeColor: "#000",
          strokeWidth: 1,
          highlight: false,
        });

        // ----- Roots of unity points z_k and labels
        const roots: JXG.Point[] = [];
        const rootLabels: JXG.Text[] = [];

        for (let k = 0; k < MAX_N; k++) {
          const pk = createPoint(
            board,
            [
              () => {
                const n = Math.max(2, Math.floor(nSlider.Value()));
                return Math.cos((TAU * k) / n);
              },
              () => {
                const n = Math.max(2, Math.floor(nSlider.Value()));
                return Math.sin((TAU * k) / n);
              },
            ],
            {
              name: "",
              size: 3,
              fixed: true,
              visible: false,
              highlight: false,
            },
            COLORS.blue
          );

          roots.push(pk);

          const tk = createText(
            board,
            [() => pk.X() + 0.06, () => pk.Y() + 0.06],
            `z_${k}`,
            { fontSize: 14, fixed: true, visible: false },
            COLORS.blue
          ) as unknown as JXG.Text;

          rootLabels.push(tk);
        }

        // ----- Polygon through the roots (regular n-gon)
        const polygonCurve = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.blue,
          strokeWidth: 3,
          highlight: false,
        }) as JXG.Curve;

        const update = () => {
          board.suspendUpdate();

          const n = Math.max(2, Math.floor(nSlider.Value()));

          // show first n roots and labels
          for (let k = 0; k < MAX_N; k++) {
            const vis = k < n;
            roots[k].setAttribute({ visible: vis });
            rootLabels[k].setAttribute({ visible: vis });
          }

          // polygon through roots and close it
          const X: number[] = [];
          const Y: number[] = [];
          for (let k = 0; k < n; k++) {
            X.push(Math.cos((TAU * k) / n));
            Y.push(Math.sin((TAU * k) / n));
          }
          X.push(X[0]);
          Y.push(Y[0]);
          polygonCurve.dataX = X;
          polygonCurve.dataY = Y;

          board.unsuspendUpdate();
          board.update();
        };

        nSlider.on("drag", update);
        nSlider.on("up", update);

        update();
      }}
    />
  );
}