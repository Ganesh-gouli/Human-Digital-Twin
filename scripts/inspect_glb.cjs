const fs = require('fs');

function inspectGlb(file) {
    const buf = fs.readFileSync(file);
    const magic = buf.readUInt32LE(0);
    if (magic !== 0x46546C67) throw new Error('Not GLB');
    const jsonLen = buf.readUInt32LE(12);
    const jsonStr = buf.toString('utf8', 20, 20 + jsonLen);
    const gltf = JSON.parse(jsonStr);
    
    console.log("Nodes:");
    gltf.nodes.forEach((n, i) => console.log(`  [${i}] ${n.name || 'unnamed'} - mesh: ${n.mesh !== undefined ? n.mesh : 'none'}`));

    console.log("\nMeshes:");
    if (gltf.meshes) {
        gltf.meshes.forEach((m, i) => {
            console.log(`  [${i}] ${m.name || 'unnamed'}`);
            m.primitives.forEach((p, j) => {
                if (p.attributes.POSITION !== undefined) {
                    const acc = gltf.accessors[p.attributes.POSITION];
                    console.log(`    Prim ${j}: min = ${JSON.stringify(acc.min)}, max = ${JSON.stringify(acc.max)}`);
                }
            });
        });
    }
}

inspectGlb('public/Inner organs.glb');
