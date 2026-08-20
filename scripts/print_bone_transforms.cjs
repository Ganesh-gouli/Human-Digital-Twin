const fs = require('fs');

function inspectBones(file) {
    const buf = fs.readFileSync(file);
    const jsonLen = buf.readUInt32LE(12);
    const jsonStr = buf.toString('utf8', 20, 20 + jsonLen);
    const gltf = JSON.parse(jsonStr);

    console.log("Nodes with translation/rotation/scale:");
    gltf.nodes.forEach((n, i) => {
        if (n.translation || n.rotation || n.scale) {
            console.log(`  Node [${i}] "${n.name || 'unnamed'}":`);
            if (n.translation) console.log(`    Translation: ${JSON.stringify(n.translation)}`);
            if (n.rotation) console.log(`    Rotation: ${JSON.stringify(n.rotation)}`);
            if (n.scale) console.log(`    Scale: ${JSON.stringify(n.scale)}`);
        }
    });

    console.log("\nSkins:");
    if (gltf.skins) {
        gltf.skins.forEach((s, i) => {
            console.log(`  Skin [${i}] "${s.name || 'unnamed'}":`);
            console.log(`    Joints: ${JSON.stringify(s.joints)}`);
        });
    }
}

inspectBones('public/human_anatomy_by_tripo.glb');
