import JSXGraphBoard from "../JSXGraphBoard";
import JXG from "jsxgraph";
import { COLORS, DEFAULT_GLIDER_ATTRIBUTES } from "../../utils/jsxgraph";

export default function MVTIntegralOptimized() {
    return (
        <JSXGraphBoard
            config={{
                boundingbox: [-1, 14, 9, -2],

            }}
            setup={(board: JXG.Board) => {
                // f(t) = 1.5 + 0.8*sin(t)
        function f(t:number) { return 1.5 + 0.8 * Math.sin(t); }
        
        // F(x) = 1.5x - 0.8cos(x) + C (Set C=0.8 so F(0)=0)
        function F(x:number) { return 1.5 * x - 0.8 * Math.cos(x) + 0.8; }



        // --- 3. GLIDERS (x and x+h) ---
        // Point x (Green)
        const p_x = board.create('glider', [2.0, 0, board.defaultAxes.x], {
            name: 'x', size:5, color:'green', label:{fontSize:14, color:'green'}
        });

        // Point x+h (Purple)
        const p_xh = board.create('glider', [3.5, 0, board.defaultAxes.x], {
            name: 'x+h', size:5, color:'purple', label:{fontSize:14, color:'purple'}
        });

        // Helper to get current h
        const getH = function() {
            return p_xh.X() - p_x.X();
        };

        // --- 4. GRAPHS ---
        // f(t) - Blue
        const graph_f = board.create('functiongraph', [f, -2, 12], {strokeColor: '#1f78b4', strokeWidth: 2});
        board.create('text', [0.5, f(0.5)+0.5, "f(t)"], {color:'#1f78b4'});

        // F(x) - Red
        const graph_F = board.create('functiongraph', [F, -2, 12], {strokeColor: '#e31a1c', strokeWidth: 3});
        board.create('text', [0.5, F(0.5)+1, "F(x)"], {color:'#e31a1c'});

        // --- 5. AREAS ---
        
        // Accumulated Area (0 to x)
        const area_acc = board.create('integral', [
            [0, function(){ return p_x.X(); }], 
            graph_f
        ], { color: '#a6cee3', fillOpacity: 0.5, label: {visible:false} });

        // Slice Area (x to x+h)
        // We use min/max to ensure fill works even if user drags x+h to the left of x
        const area_slice = board.create('integral', [
            [function(){ return Math.min(p_x.X(), p_xh.X()); }, function(){ return Math.max(p_x.X(), p_xh.X()); }], 
            graph_f
        ], { color: '#ff7f00', fillOpacity: 0.5, label: {visible:false} });


        // --- 6. MVT RECTANGLE & CALCULATIONS ---

        // Calculate Average Height: (F(end) - F(start)) / (end - start)
        const getAvgHeight = function() {
            const h = getH();
            // Prevent division by zero if points overlap
            if(Math.abs(h) < 0.001) return f(p_x.X()); 
            return (F(p_xh.X()) - F(p_x.X())) / h;
        };

        // Rectangle Points
        const r1 = board.create('point', [function(){ return p_x.X(); }, 0], {visible:false});
        const r2 = board.create('point', [function(){ return p_xh.X(); }, 0], {visible:false});
        const r3 = board.create('point', [function(){ return p_xh.X(); }, getAvgHeight], {visible:false});
        const r4 = board.create('point', [function(){ return p_x.X(); }, getAvgHeight], {visible:false});

        // The Polygon
        board.create('polygon', [r1,r2,r3,r4], {
            fillColor: 'none', strokeColor: '#33a02c', strokeWidth: 2, dash:2
        });


        // --- 7. FINDING XI (The Mean Value Point) ---
        const getXi = function() {
            const x1 = p_x.X();
            const x2 = p_xh.X();
            const targetY = getAvgHeight();
            
            const start = Math.min(x1, x2);
            const end = Math.max(x1, x2);
            let bestT = start;
            let minDiff = 1000;
            
            // Numerical search for intersection
            const steps = 50;
            for(let i=0; i<=steps; i++) {
                const t = start + ((end-start) * (i/steps));
                const val = f(t);
                if(Math.abs(val - targetY) < minDiff) {
                    minDiff = Math.abs(val - targetY);
                    bestT = t;
                }
            }
            return bestT;
        };

        // Visualizing Xi
        const p_xi = board.create('point', [getXi, getAvgHeight], {
            name: '', face:'x', size:5, color:'#33a02c', fixed:true
        });
        
        const p_xi_axis = board.create('point', [getXi, 0], {
            name: 'ξ', size:0, label:{color:'#33a02c', offset:[0,-10]}
        });

        board.create('segment', [p_xi, p_xi_axis], {
            strokeColor: '#33a02c', dash:2, strokeWidth:1
        });


        // --- 8. SECANT LINE on F(x) ---
        // This connects F(x) and F(x+h)
        const F_p1 = board.create('point', [
            function(){ return p_x.X(); }, 
            function(){ return F(p_x.X()); }
        ], {visible:true, name:'', size:2, color:'#e31a1c'});

        const F_p2 = board.create('point', [
            function(){ return p_xh.X(); }, 
            function(){ return F(p_xh.X()); }
        ], {visible:true, name:'', size:2, color:'#e31a1c'});

        board.create('line', [F_p1, F_p2], {
            strokeColor: '#e31a1c', dash:3, strokeOpacity: 0.6
        });
        
        // Vertical dashed guides connecting x-axis to F-curve
        board.create('segment', [[function(){ return p_x.X(); },0], F_p1], {strokeColor:'#aaa', dash:1, strokeWidth:1});
        board.create('segment', [[function(){ return p_xh.X(); },0], F_p2], {strokeColor:'#aaa', dash:1, strokeWidth:1});

            }}
        />
    );
}