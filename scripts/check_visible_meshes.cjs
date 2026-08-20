const fs = require('fs');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { JSDOM } = require('jsdom');

const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.URL = dom.window.URL;

const gltfLoader = new GLTFLoader();
const glbBuffer = fs.readFileSync('public/human_anatomy_by_tripo.glb');

gltfLoader.parse(glbBuffer.buffer.slice(glbBuffer.byteOffset, glbBuffer.byteOffset + glbBuffer.byteLength), '', (gltf) => {
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    
    console.log('--- Inspecting all Meshes in GLB ---');
    let index = 0;
    scene.traverse(child => {
        if (child.isMesh) {
            const geom = child.geometry;
            geom.computeBoundingBox();
            const bbox = geom.boundingBox;
            const size = bbox.getSize(new THREE.Vector3());
            const center = bbox.getCenter(new THREE.Vector3());
            
            console.log(`Mesh #${index++}: Name: "${child.name}", Type: ${child.type}`);
            console.log(`  Visible: ${child.visible}`);
            console.log(`  Local Position:`, child.position.toArray());
            console.log(`  Local Scale:`, child.scale.toArray());
            console.log(`  Geometry Bounds Min:`, bbox.min.toArray());
            console.log(`  Geometry Bounds Max:`, bbox.max.toArray());
            console.log(`  Geometry Size:`, size.toArray());
            console.log(`  Geometry Center:`, center.toArray());
        }
    });
}, (err) => {
    console.error(err);
});
