import JSXGraphBoard from "../JSXGraphBoard";
import * as JXG from "jsxgraph";
import { COLORS } from "../../utils/jsxgraph";

export default function ComplexMultiplicationPolarApplet() {
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
        const TAU = 2 * Math.PI;

        const Z1_COLOR = COLORS.green;
        const Z2_COLOR = COLORS.red;
        const Z_COLOR = "#111";       // product
        const PHI_COLOR = "#1565C0";  // φ = arg(z) (blue)

        const arg = (x: number, y: number) => {
          const a = Math.atan2(y, x);
          return a < 0 ? a + TAU : a; // [0, 2π)
        };
        const mod = (x: number, y: number) => Math.hypot(x, y);


        board.create("text", [3.15, 0.2, "Re(z)"], {
          fixed: true,
          fontSize: 18,
          anchorX: "left",
        });
        board.create("text", [-0.15, 3.15, "Im(z)"], {
          fixed: true,
          fontSize: 18,
          anchorX: "left",
        });

        // Origin and a hidden unit point for angle construction
        const O = board.create("point", [0, 0], {
          name: "",
          fixed: true,
          size: 3,
          strokeColor: "#000",
          fillColor: "#000",
          highlight: false,
        });

        const U = board.create("point", [1, 0], { visible: false, fixed: true, name: "" });

        // ------------------------------------------------------------
        // Draggable z1, z2 (constrained away from origin)
        // ------------------------------------------------------------
        const z1 = board.create("point", [2.3, 1.1], {
          name: "",
          size: 4,
          color: Z1_COLOR,
          fillColor: Z1_COLOR,
          withLabel: false,
        });

        const z2 = board.create("point", [1.1, 2.0], {
          name: "",
          size: 4,
          color: Z2_COLOR,
          fillColor: Z2_COLOR,
          withLabel: false,
        });

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
          // If exactly at origin, push to (MIN_RADIUS, 0)
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
        const z = board.create(
          "point",
          [
            () => z1.X() * z2.X() - z1.Y() * z2.Y(),
            () => z1.X() * z2.Y() + z1.Y() * z2.X(),
          ],
          {
            name: "",
            size: 4,
            color: Z_COLOR,
            fillColor: Z_COLOR,
            fixed: true,
            withLabel: false,
          }
        );

        // ------------------------------------------------------------
        // Vectors (arrows)
        // ------------------------------------------------------------
        const arrowStyle = {
          straightFirst: false,
          straightLast: false,
          lastArrow: true,
          strokeWidth: 3,
          highlight: false,
        };

        board.create("arrow", [O, z1], { ...arrowStyle, strokeColor: Z1_COLOR });
        board.create("arrow", [O, z2], { ...arrowStyle, strokeColor: Z2_COLOR });
        board.create("arrow", [O, z], { ...arrowStyle, strokeColor: Z_COLOR });

        // Simple labels z1, z2, z
        board.create("text", [() => z1.X() + 0.12, () => z1.Y() + 0.12, "z₁"], {
          color: Z1_COLOR,
          fontSize: 18,
        });
        board.create("text", [() => z2.X() + 0.12, () => z2.Y() + 0.12, "z₂"], {
          color: Z2_COLOR,
          fontSize: 18,
        });
        board.create("text", [() => z.X() + 0.12, () => z.Y() + 0.12, "z"], {
          color: Z_COLOR,
          fontSize: 18,
        });

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

        // ------------------------------------------------------------
        // Polar-form labels near points: z = r e^{iφ}
        // ------------------------------------------------------------
        const polarLabel = (
          p: JXG.Point,
          color: string,
          name: string,
          dx: number,
          dy: number
        ) =>
          board.create(
            "text",
            [
              () => p.X() + dx,
              () => p.Y() + dy,
              () => {
                const r = mod(p.X(), p.Y());
                const phi = arg(p.X(), p.Y());
                return `${name} = ${r.toFixed(2)} e^{i·${phi.toFixed(2)}}`;
              },
            ],
            { color, fontSize: 14 }
          );

        polarLabel(z1, Z1_COLOR, "z₁", 0.12, -0.40);
        polarLabel(z2, Z2_COLOR, "z₂", 0.12, -0.40);
        polarLabel(z, Z_COLOR, "z", 0.12, -0.40);


        // Initial constraint enforcement
        enforceMinRadius(z1);
        enforceMinRadius(z2);
      }}
    />
  );
}