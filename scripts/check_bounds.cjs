const fs = require('fs');

// Need a mock DOM for GLTFLoader unfortunately, or just use a glTF parser package, but three's GLTFLoader requires a DOM.
// Wait, OBJLoader requires DOM too? No, let's see.
// Actually, it's easier to just parse the GLB manually or use a lightweight parser to get min/max of position attributes.

function getObjBounds(file) {
    const text = fs.readFileSync(file, 'utf8');
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    text.split('\n').forEach(line => {
        if (line.startsWith('v ')) {
            const parts = line.trim().split(/\s+/);
            const x = parseFloat(parts[1]);
            const y = parseFloat(parts[2]);
            const z = parseFloat(parts[3]);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            if (z < minZ) minZ = z;
            if (z > maxZ) maxZ = z;
        }
    });
    return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
}

console.log('Human.obj bounds:', getObjBounds('public/Human.obj'));

function getGlbBounds(file) {
    const buf = fs.readFileSync(file);
    const magic = buf.readUInt32LE(0);
    if (magic !== 0x46546C67) throw new Error('Not GLB');
    const jsonLen = buf.readUInt32LE(12);
    const jsonStr = buf.toString('utf8', 20, 20 + jsonLen);
    const gltf = JSON.parse(jsonStr);
    
    // Quick find all position accessors
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    gltf.meshes.forEach(mesh => {
        mesh.primitives.forEach(prim => {
            if (prim.attributes.POSITION !== undefined) {
                const accessor = gltf.accessors[prim.attributes.POSITION];
                if (accessor.min && accessor.max) {
                    if (accessor.min[0] < minX) minX = accessor.min[0];
                    if (accessor.min[1] < minY) minY = accessor.min[1];
                    if (accessor.min[2] < minZ) minZ = accessor.min[2];
                    if (accessor.max[0] > maxX) maxX = accessor.max[0];
                    if (accessor.max[1] > maxY) maxY = accessor.max[1];
                    if (accessor.max[2] > maxZ) maxZ = accessor.max[2];
                }
            }
        });
    });
    return { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] };
}

console.log('Muscles bounds:', getGlbBounds('public/human_anatomy_by_tripo.glb'));
