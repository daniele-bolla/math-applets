import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS } from "../../utils/jsxgraph";

export default function ComplexRootsOfunity() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1.6, 1.6, 2.1, -1.6],
        axis: true,
        showZoom: false,
        showNavigation: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        const TAU = 2 * Math.PI;
        const MAX_N = 24;

        // ----- Axis labels
        board.create("text", [1.55, 0.15, "Re(z)"], {
          fixed: true,
          fontSize: 18,
          anchorX: "left",
        });
        board.create("text", [-0.2, 1.35, "Im(z)"], {
          fixed: true,
          fontSize: 18,
          anchorX: "left",
        });

        // ----- Sliders (BOTTOM-RIGHT)
        const nSlider = board.create(
          "slider",
          [
            [0.6, -1.25],
            [1.6, -1.25],
            [0, 0, MAX_N],
          ],
          { name: "n", snapWidth: 1, precision: 0 }
        ) as JXG.Slider;

      const xSlider = board.create(
        "slider",
        [
          [0.6, -1.42],
          [1.6, -1.42],
          [0, 0, TAU],           // min=0, start=0, max=2π
        ],
        { name: "x", snapWidth: 0.01, precision: 2 }
      ) as JXG.Slider;

        // ----- Base points and unit circle
        const O = board.create("point", [0, 0], {
          name: "",
          fixed: true,
          size: 2,
          strokeColor: "#000",
          fillColor: "#000",
          highlight: false,
        });

        const One = board.create("point", [1, 0], {
          name: "1",
          fixed: true,
          size: 3,
          strokeColor: "#000",
          fillColor: "#000",
          label: { offset: [6, -12], fontSize: 14 },
          highlight: false,
        });

        board.create("circle", [O, One], {
          strokeColor: "#000",
          strokeWidth: 2,
          highlight: false,
        });

        // ----- Continuous point z = e^{ix}
        const z = board.create(
          "point",
          [
            () => Math.cos(xSlider.Value()),
            () => Math.sin(xSlider.Value()),
          ],
          {
            name: "e^{ix}",
            size: 3,
            color: COLORS.red,
            fillColor: COLORS.red,
            fixed: true,
            label: { offset: [-28, -28], fontSize: 14, color: COLORS.red },
            highlight: false,
          }
        );

        // Ray from origin to e^{ix}
        board.create("arrow", [O, z], {
          strokeColor: COLORS.red,
          strokeWidth: 3,
          straightFirst: false,
          straightLast: false,
          lastArrow: true,
          highlight: false,
        });

        // Arc from 1 to e^{ix} (shows “x is an angle”)
        const arcCurve = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.red,
          strokeWidth: 3,
          strokeOpacity: 0.55,
          highlight: false,
        });

        board.create("angle", [One, O, z], {
          type: "sector",
          name: "",
          radius: 0.72,
          fillColor: COLORS.red,
          fillOpacity: 0.18,
          strokeColor: COLORS.red,
          strokeOpacity: 0.35,
          strokeWidth: 2,
          highlight: false,
          label: { visible: false },
          orthoType: "none",
          orthoSensitivity: 0,
        });

        // ----- Roots of unity points z_k and polygon
        const roots: JXG.Point[] = [];
        for (let k = 0; k < MAX_N; k++) {
          roots.push(
            board.create(
              "point",
              [
                () => Math.cos((TAU * k) / Math.floor(nSlider.Value())),
                () => Math.sin((TAU * k) / Math.floor(nSlider.Value())),
              ],
              {
                name: "",
                size: 3,
                color: COLORS.blue,
                fillColor: COLORS.blue,
                fixed: true,
                visible: false,
                highlight: false,
              }
            )
          );
        }

        const polygonCurve = board.create("curve", [[0], [0]], {
          strokeColor: COLORS.blue,
          strokeWidth: 3,
          highlight: false,
        });

        // Highlight nearest root to current angle x
        const highlight = board.create("point", [1, 0], {
          name: "",
          size: 5,
          color: COLORS.blue,
          fillColor: COLORS.blue,
          fixed: true,
          visible: true,
          highlight: false,
        });

        board.create(
          "text",
          [
            () => highlight.X() + 0.08,
            () => highlight.Y() + 0.08,
            () => {
              const n = Math.max(2, Math.floor(nSlider.Value()));
              const x = xSlider.Value();
              const k = ((Math.round((n * x) / TAU) % n) + n) % n;
              return `z_${k}`;
            },
          ],
          { fontSize: 16, color: COLORS.blue }
        );

        const update = () => {
          board.suspendUpdate();

          const n = Math.max(2, Math.floor(nSlider.Value()));
          const x = xSlider.Value();

          // show first n roots
          for (let k = 0; k < MAX_N; k++) roots[k].setAttribute({ visible: k < n });

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

          // arc from 0 to x
          const steps = 220;
          const ax: number[] = [];
          const ay: number[] = [];
          for (let i = 0; i <= steps; i++) {
            const t = (x * i) / steps;
            ax.push(Math.cos(t));
            ay.push(Math.sin(t));
          }
          arcCurve.dataX = ax;
          arcCurve.dataY = ay;

          // nearest root index to x
          const kNearest = ((Math.round((n * x) / TAU) % n) + n) % n;
          highlight.setPosition(JXG.COORDS_BY_USER, [
            Math.cos((TAU * kNearest) / n),
            Math.sin((TAU * kNearest) / n),
          ]);

          board.unsuspendUpdate();
          board.update();
        };

        nSlider.on("drag", update);
        nSlider.on("up", update);
        xSlider.on("drag", update);
        xSlider.on("up", update);

        update();
      }}
    />
  );
}