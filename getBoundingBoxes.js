const fs = require('fs');
const uaePathsStr = fs.readFileSync('uae-paths.js', 'utf8');
const pathsMatch = uaePathsStr.match(/const UAE_PATHS = \[(.*?)\];/s);
if (pathsMatch) {
    const paths = JSON.parse('[' + pathsMatch[1] + ']');
    paths.forEach((p, i) => {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        // The path strings use relative coordinates. We have to parse them properly to get the bounds.
        // A simple approach is just drawing it to a canvas and finding bounds, but we are in node.
        // Let's just do a naive split on letters and track absolute position
        let x = 0, y = 0;
        let tokens = p.split(/([a-zA-Z])/).filter(t => t.trim() !== '');
        
        let currentCommand = '';
        for (let t of tokens) {
            if (t.match(/[a-zA-Z]/)) {
                currentCommand = t;
            } else {
                let numbers = t.match(/-?\d+\.?\d*/g);
                if (numbers) {
                    for (let j = 0; j < numbers.length; j += 2) {
                        let nx = Number(numbers[j]);
                        let ny = Number(numbers[j+1]);
                        if (currentCommand === 'm' || currentCommand === 'l') {
                            x += nx; y += ny;
                        } else if (currentCommand === 'M' || currentCommand === 'L') {
                            x = nx; y = ny;
                        }
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }
        }
        
        console.log(`Path ${i}: CenterX=${((minX+maxX)/2).toFixed(2)}, CenterY=${((minY+maxY)/2).toFixed(2)} | MinX=${minX.toFixed(2)}, MaxX=${maxX.toFixed(2)}, MinY=${minY.toFixed(2)}, MaxY=${maxY.toFixed(2)}`);
    });
}
