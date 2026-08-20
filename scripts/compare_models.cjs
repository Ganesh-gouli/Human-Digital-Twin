const fs = require('fs');
const THREE = require('three');
const { OBJLoader } = require('three/examples/jsm/loaders/OBJLoader.js');

// Since we are in Node.js, we don't have GLTFLoader easily without a DOM or parser.
// But we can parse the OBJ file using OBJLoader!
// Wait, OBJLoader requires some browser globals or we can just run it in Node if we mock it?
// Actually, THREE.OBJLoader can run in Node.js if we pass the text.
// Let's see:

const objText = fs.readFileSync('public/Human.obj', 'utf8');
const loader = new OBJLoader();
const obj = loader.parse(objText);

// Compute bounding box for OBJ
obj.position.set(0, 0, 0);
obj.scale.setScalar(1);
obj.updateMatrixWorld(true);

const objBox = new THREE.Box3().setFromObject(obj);
const objCenter = objBox.getCenter(new THREE.Vector3());
const objSize = objBox.getSize(new THREE.Vector3());
const objMaxDim = Math.max(objSize.x, objSize.y, objSize.z);
const objS = 4.0 / (objMaxDim || 1);

console.log('--- Human.obj (Anatomy) ---');
console.log('Scale factor s:', objS);
console.log('Original Box Min:', objBox.min.toArray());
console.log('Original Box Max:', objBox.max.toArray());
console.log('Original Center:', objCenter.toArray());
console.log('Original Size:', objSize.toArray());
console.log('Shifted Position:', [-objCenter.x * objS, -objCenter.y * objS, -objCenter.z * objS]);

// Now let's calculate for GLB manually using the accessor min/max we got earlier:
// Muscles bounds (before rotation):
// min: [ -0.1562803089618683, -2.5420010985044428e-8, -0.2804870307445526 ]
// max: [ 0.156280517578125, 1.000000238418579, 0.2804868519306183 ]
// Let's apply Y-rotation of Math.PI / 2 to these bounds.
// A rotation of 90 degrees around Y maps:
// X_new = Z_old
// Z_new = -X_old
// So:
// X_min_new = Z_min_old = -0.28048703
// X_max_new = Z_max_old = 0.28048685
// Y_min_new = Y_min_old = 0
// Y_max_new = Y_max_old = 1.0
// Z_min_new = -X_max_old = -0.1562805
// Z_max_new = -X_min_old = 0.1562803
// So the rotated bounds are:
// Min: [-0.28048703, 0, -0.1562805]
// Max: [0.28048685, 1.0, 0.1562803]

const glbBox = new THREE.Box3(
    new THREE.Vector3(-0.28048703, 0, -0.1562805),
    new THREE.Vector3(0.28048685, 1.0, 0.1562803)
);
const glbCenter = glbBox.getCenter(new THREE.Vector3());
const glbSize = glbBox.getSize(new THREE.Vector3());
const glbMaxDim = Math.max(glbSize.x, glbSize.y, glbSize.z);
const glbS = 4.0 / (glbMaxDim || 1);

console.log('--- Muscles (GLB) ---');
console.log('Scale factor s:', glbS);
console.log('Original Box Min:', glbBox.min.toArray());
console.log('Original Box Max:', glbBox.max.toArray());
console.log('Original Center:', glbCenter.toArray());
console.log('Original Size:', glbSize.toArray());
console.log('Shifted Position:', [-glbCenter.x * glbS, -glbCenter.y * glbS, -glbCenter.z * glbS]);
