import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS } from "../../utils/jsxgraph";

type Pt = [number, number];

function mid(A: Pt, B: Pt): Pt {
  return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
}

export default function GeometricSeriesMabry() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1.25, 1.95, 1.25, -0.25],
        axis: false,
        showZoom: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {
        const MAX_LAYERS = 10;

        // Outer equilateral triangle
        const A: Pt = [-1, 0];
        const B: Pt = [1, 0];
        const C: Pt = [0, Math.sqrt(3)];

        // Outline
        board.create("polygon", [A, B, C], {
          borders: { strokeColor: "#333", strokeWidth: 2 },
          hasInnerPoints: false,
          fillOpacity: 0,
          highlight: false,
          vertices: {
          visible: false,
          withLabel: false,
          fixed: true,
          highlight: false,
          },
        });

        // Slider (bottom-right)
        const nSlider = board.create(
          "slider",
          [
            [0.20, -0.14],
            [1.10, -0.14],
            [0, 4, MAX_LAYERS],
          ],
          { name: "N", snapWidth: 1, precision: 0 }
        ) as JXG.Slider;

        // Build layers
        // T_k is the current upright triangle; we shade the medial triangle inside it.
        let L: Pt = A;
        let R: Pt = B;
        let T: Pt = C;

        const shaded: JXG.Polygon[] = [];
        const layerOutlines: JXG.Polygon[] = [];

        for (let k = 1; k <= MAX_LAYERS; k++) {
          const TL = mid(T, L);
          const TR = mid(T, R);
          const LR = mid(L, R);

          // Optional: outline the current top triangle T_k (light)
          const outline = board.create("polygon", [L, R, T], {
            borders: { strokeColor: "#999", strokeWidth: 1, dash: 1, strokeOpacity: 0.5 },
            hasInnerPoints: false,
            fillOpacity: 0,
            highlight: false,
            visible: k <= Math.floor(nSlider.Value()),
            vertices: {
          visible: false,
          withLabel: false,
          fixed: true,
          highlight: false,
          }
          }) as JXG.Polygon;
          layerOutlines.push(outline);

          // The medial (inverted) triangle inside T_k has area = (1/4) area(T_k)
          const tri = board.create("polygon", [TL, TR, LR], {
            borders: { strokeColor: "#444", strokeWidth: 1, strokeOpacity: 0.35 },
            hasInnerPoints: false,
            fillColor: "#f2d400", // yellow
            fillOpacity: 0.85,
            highlight: false,
            visible: k <= Math.floor(nSlider.Value()),
            vertices: {
          visible: false,
          withLabel: false,
          fixed: true,
          highlight: false,
          }
          }) as JXG.Polygon;
          shaded.push(tri);

          // Next upright triangle is the top corner triangle (similar, area scaled by 1/4)
          L = TL;
          R = TR;
          T = T;
        }

        const update = () => {
          board.suspendUpdate();
          const N = Math.floor(nSlider.Value());

          for (let k = 0; k < MAX_LAYERS; k++) {
            shaded[k].setAttribute({ visible: k + 1 <= N });
            layerOutlines[k].setAttribute({ visible: k + 1 <= N });
          }

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