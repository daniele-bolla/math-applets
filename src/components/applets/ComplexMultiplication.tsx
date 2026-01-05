import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import {
    COLORS,
    createText,
    createPoint,
    createArrow
} from "../../utils/jsxgraph";

export default function ComplexMultiplicationApplet() {
  return (
    <JSXGraphBoard
      config={{
        boundingbox: [-1.2, 3.4, 3.8, -1.8],
        axis: true,
        showZoom: false,
        showNavigation: false,
        pan: { enabled: false },
      }}
      setup={(board: JXG.Board) => {

        const Z1_COLOR = COLORS.green;
        const Z2_COLOR = COLORS.red;
        const Z_COLOR = "#111";       // product
        const PHI_COLOR = "#1565C0";  // φ = arg(z) (blue)

        createText(board, [3.15, 0.2], "Re(z)", {
          fixed: true,
          anchorX: "left",
        });
        createText(board, [-0.15, 3.15], "Im(z)", {
          fixed: true,
          anchorX: "left",
        });

        // Origin and a hidden unit point for angle construction
        const O = createPoint(board, [0, 0], {
          name: "",
          fixed: true,
          highlight: false,
        });

        const U = createPoint(board, [1, 0], {
          visible: false,
          fixed: true,
          name: ""
        });

        // ------------------------------------------------------------
        // Draggable z1, z2 (constrained away from origin)
        // ------------------------------------------------------------
        const z1 = createPoint(board, [2.3, 1.1], {
          name: "",
          withLabel: false,
        }, Z1_COLOR);

        const z2 = createPoint(board, [1.1, 2.0], {
          name: "",
          withLabel: false,
        }, Z2_COLOR);

        // Keep points away from origin so arg(z) is stable/meaningful
        const MIN_RADIUS = 0.35;
        let correcting = false;

        const enforceMinRadius = (p: JXG.Point) => {
          if (correcting) return;
          const x = p.X();
          const y = p.Y();
          const r = Math.hypot(x, y);
          if (r >= MIN_RADIUS) return;

          correcting = true;
          if (r < 1e-12) {
            p.setPosition(JXG.COORDS_BY_USER, [MIN_RADIUS, 0]);
          } else {
            const s = MIN_RADIUS / r;
            p.setPosition(JXG.COORDS_BY_USER, [s * x, s * y]);
          }
          correcting = false;
        };

        z1.on("drag", () => enforceMinRadius(z1));
        z2.on("drag", () => enforceMinRadius(z2));
        z1.on("up", () => enforceMinRadius(z1));
        z2.on("up", () => enforceMinRadius(z2));

        // ------------------------------------------------------------
        // Product z = z1 z2
        // ------------------------------------------------------------
        const z = createPoint(board,
          [
            () => z1.X() * z2.X() - z1.Y() * z2.Y(),
            () => z1.X() * z2.Y() + z1.Y() * z2.X(),
          ],
          {
            name: "",
            fixed: true,
            withLabel: false,
          },
          Z_COLOR
        );

        // ------------------------------------------------------------
        // Vectors (arrows)
        // ------------------------------------------------------------
        createArrow(board, [O, z1], {
          straightFirst: false,
          straightLast: false,
          highlight: false,
        }, Z1_COLOR);

        createArrow(board, [O, z2], {
          straightFirst: false,
          straightLast: false,
          highlight: false,
        }, Z2_COLOR);

        createArrow(board, [O, z], {
          straightFirst: false,
          straightLast: false,
          highlight: false,
        }, Z_COLOR);

        // Simple labels z1, z2, z
        createText(board, [() => z1.X() + 0.12, () => z1.Y() + 0.12], "z₁", {
        }, Z1_COLOR);

        createText(board, [() => z2.X() + 0.12, () => z2.Y() + 0.12], "z₂", {
        }, Z2_COLOR);

        createText(board, [() => z.X() + 0.12, () => z.Y() + 0.12], "z", {
        }, Z_COLOR);

        // ------------------------------------------------------------
        // Angle sectors (φ1, φ2, φ)
        // ------------------------------------------------------------
        const sectorCommon = {
          type: "sector" as const,
          orthoType: "square" as const,
          orthoSensitivity: 2,
          strokeOpacity: 0.25,
          fillOpacity: 0.20,
          highlight: false,
        };

        board.create("angle", [U, O, z1], {
          ...sectorCommon,
          name: "φ₁",
          radius: 0.75,
          fillColor: Z1_COLOR,
          strokeColor: Z1_COLOR,
        });

        board.create("angle", [U, O, z2], {
          ...sectorCommon,
          name: "φ₂",
          radius: 1.05,
          fillColor: Z2_COLOR,
          strokeColor: Z2_COLOR,
        });

        board.create("angle", [U, O, z], {
          ...sectorCommon,
          name: "φ",
          radius: 1.35,
          fillColor: PHI_COLOR,
          strokeColor: PHI_COLOR,
          fillOpacity: 0.16,
        });

        // Initial constraint enforcement
        enforceMinRadius(z1);
        enforceMinRadius(z2);
      }}
    />
  );
}