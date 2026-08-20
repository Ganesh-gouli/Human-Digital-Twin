const fs = require('fs');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');
const { JSDOM } = require('jsdom');

// We need a DOM for GLTFLoader because it uses URL and other web APIs
const dom = new JSDOM();
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.URL = dom.window.URL;

const gltfLoader = new GLTFLoader();
const glbBuffer = fs.readFileSync('public/Inner organs.glb');

// GLTFLoader parse
gltfLoader.parse(glbBuffer.buffer.slice(glbBuffer.byteOffset, glbBuffer.byteOffset + glbBuffer.byteLength), '', (gltf) => {
    const scene = gltf.scene;
    scene.updateMatrixWorld(true);
    
    console.log('--- GLB Scene Hierarchy ---');
    scene.traverse(child => {
        const wp = new THREE.Vector3();
        child.getWorldPosition(wp);
        if (child.isMesh) {
            const box = new THREE.Box3().setFromObject(child);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            console.log(`Mesh: ${child.name || 'unnamed'} (${child.type})`);
            console.log(`  Local Pos:`, child.position.toArray());
            console.log(`  World Pos:`, wp.toArray());
            console.log(`  World Box Min:`, box.min.toArray());
            console.log(`  World Box Max:`, box.max.toArray());
            console.log(`  World Center:`, center.toArray());
            console.log(`  World Size:`, size.toArray());
        } else {
            console.log(`Node: ${child.name || 'unnamed'} (${child.type})`);
            console.log(`  Local Pos:`, child.position.toArray());
            console.log(`  World Pos:`, wp.toArray());
        }
    });
}, (err) => {
    console.error(err);
});
