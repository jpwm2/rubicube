const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 0.1, 1000);

camera.position.z = 6;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', function() {
    // カメラのアスペクト比を更新
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // レンダラのサイズを更新
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const cameraDistance = 1;
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let isDragging = false;
let isCube = false;
let selectedObject = null;
let intersectObjects = null;
let prevMousePos = new THREE.Vector3();
let delta = new THREE.Vector3();
let theta = 0;
let phi = Math.PI/2;
const radius = camera.position.z;

const xAxle = new THREE.Vector3(1,0,0);
const yAxle = new THREE.Vector3(0,1,0);
const zAxle = new THREE.Vector3(0,0,1);
let axle = null;
let axleLock = false;

let selectedX = null;    
let selectedY = null;
let selectedZ = null;

document.addEventListener('mousedown', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    intersectObjects = raycaster.intersectObjects(flatCubes);
    isDragging = true;
    prevMousePos.x = e.clientX;
    prevMousePos.y = e.clientY;
    if (intersectObjects.length === 0){
        isCube = false;

    }else{
        isCube = true;
    }
});


document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    delta.x = e.clientX - prevMousePos.x;
    delta.y = e.clientY - prevMousePos.y;
    if (!isCube){
    
        theta -= delta.x * 0.005;
        phi -= delta.y * 0.005;
    
        // phi の範囲を制約
        phi = Math.min(Math.max(0.1, phi), Math.PI - 0.1);
    
        updateCameraPosition();

    }else{
        updateCubePosition()
    }
    
    prevMousePos.x = e.clientX;
    prevMousePos.y = e.clientY;

    }
);

function updateCubePosition(){

    if (!axleLock){let position = new THREE.Vector3();
        let quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        intersectObjects[0].object.matrixWorld.decompose(position, quaternion, scale);
        intersectObjects[0].face.normal.applyQuaternion(quaternion).normalize();
    
        const vector = intersectObjects[0].face.normal;
        
        if (Math.abs(xAxle.dot(vector)) < 1e-6){
            if (Math.abs(yAxle.dot(vector)) < 1e-6){
                if (Math.abs(vectorRelationship(xAxle, delta)) < 0.5){
                    axle = 0;
                }else{
                    axle = 1;
                }
            }else{
                if (Math.abs(vectorRelationship(xAxle, delta)) < 0.5){
                    axle = 2;
                }else{
                    axle = 0;
                }
            }
        }else{
            if (Math.abs(vectorRelationship(yAxle, delta)) < 0.5){
                axle = 1;
            }else{
                axle = 2;
            }
        }
        
        selectedObject = intersectObjects[0].object;
        selectedX = Math.round(selectedObject.position.x) + 1;
        selectedY = Math.round(selectedObject.position.y) + 1;
        selectedZ = Math.round(selectedObject.position.z) + 1;
        
        /*
        for(let x = 0; x < cubes.length; x++){
            for(let y = 0; y < cubes[x].length; y++){
                for(let z = 0; z < cubes[x][y].length; z++){
                    if(selectedObject === (cubes[x][y][z])){
                        selectedX = x;                    
                        selectedY = y;
                        selectedZ = z;
                        break;                    
                    }
                }
            }
        }
        */
        axleLock = true;
    }
    unCubes =deepCopyArray(cubes);

    delta.multiplyScalar(0.005);
    if(axle == 0){
        for(let y = 0;y < 3;y++){
            for(let z = 0; z < 3; z++){
                cubes[selectedX][y][z].rotate(delta.y,0,0)
            }
        }
    }else if(axle == 1){
        for(let x = 0; x < 3; x++){
            for(let z = 0; z < 3; z++){
                cubes[x][selectedY][z].rotate(0,delta.x,0); 

            }
        }
    }else{
        for(let x = 0; x<3; x++){
            for(let y = 0; y<3; y++){
                cubes[x][y][selectedZ].rotate(0,0,delta.y);
            }
        }
    }
    
    for (let i = 0; i < 3; i++){
        for (let j = 0; j < 3; j++){
            for (let k = 0; k < 3; k++){
                if(unCubes[i][j][k] == null){
                    unCubes[i][j][k] = cubes[i][j][k];
                }
            }
        }
    }
    cubes =deepCopyArray(unCubes);

    function deepCopyArray(arr) {
        if (Array.isArray(arr)) {
          return arr.map(deepCopyArray);
        } else {
          return arr;
        }
      }
    
    function vectorRelationship(A, B) {
        const dotProduct = A.dot(B);
        const magnitudeA = A.length();
        const magnitudeB = B.length();
        const cosTheta = dotProduct / (magnitudeA * magnitudeB);
        return cosTheta;
      }

}

function updateCameraPosition() {
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);
}
document.addEventListener('mouseup',() =>{
    isDragging = false;
    axleLock = false;
});

class Cube extends THREE.Mesh {
    constructor(size, color0, color1, color2, color3, color4, color5, x, y, z) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const materials = [
            new THREE.MeshBasicMaterial({ color: new THREE.Color(color0) }),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(color1) }),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(color2) }),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(color3) }),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(color4) }),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(color5) }),
        ];
        super(geometry, materials);
        this.position.set(x, y, z);
        this.rx = 0;
        this.ry = 0;
        this.rz = 0;
    }

    rotate(rx, ry, rz) {
        const cosRx = Math.cos(rx);
        const sinRx = Math.sin(rx);
        const cosRy = Math.cos(ry);
        const sinRy = Math.sin(ry);
        const cosRz = Math.cos(rz);
        const sinRz = Math.sin(rz);

        const x = this.position.x;
        const y = this.position.y;
        const z = this.position.z;

        // Apply rotation transformation for each axis
        const newX = cosRy * cosRz * x + (sinRx * sinRy * cosRz - cosRx * sinRz) * y + (cosRx * sinRy * cosRz + sinRx * sinRz) * z;
        const newY = cosRy * sinRz * x + (sinRx * sinRy * sinRz + cosRx * cosRz) * y + (cosRx * sinRy * sinRz - sinRx * cosRz) * z;
        const newZ = -sinRy * x + sinRx * cosRy * y + cosRx * cosRy * z;

        this.position.set(newX, newY, newZ);
        this.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), rx);
        this.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), ry);
        this.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), rz);

        
        this.rx += rx;
        this.ry += ry;
        this.rz += rz;

        if(this.rx > Math.PI/2 || this.rx < -Math.PI/2 ){
            this.rx = this.rx % (Math.PI/2);
            
            unCubes[Math.round(this.position.x)+1][Math.round(this.position.y)+1][Math.round(this.position.z)+1] = this;
        }else if(this.ry > Math.PI/2 || this.ry < -Math.PI/2){
            
            this.ry = this.ry % (Math.PI/2);


            unCubes[Math.round(this.position.x)+1][Math.round(this.position.y)+1][Math.round(this.position.z)+1] = this;

        }else if(this.rz > Math.PI/2 || this.rz < -Math.PI/2){
            this.rz = this.rz % (Math.PI/2);
            unCubes[Math.round(this.position.x)+1][Math.round(this.position.y)+1][Math.round(this.position.z)+1] = this;

        }
    }
    autoRotate(){
        if(this.rx != 0){
            this.rotate(-this.rx,0,0);
        }else if (this.ry != 0){
            this.rotate(0,-this.ry,0);
        }else if (this.rz != 0){
            this.rotate(0,0,-this.rz);
        }
    }
}




const size = 0.98;
const white = "hsl(0, 0%, 100%)";
const yellow = "hsl(60, 100%, 50%)";
const green = "hsl(120, 100%, 50%)";
const blue = "hsl(240, 100%, 50%)";
const red = "hsl(0, 100%, 50%)";
const orange = "hsl(30, 100%, 50%)";
const gray = "#A9A9A9";


let cubes = [];
let unCubes = [];
const flatCubes =[];

for(let i = 0; i < 3; i++) {
    cubes[i] = [];
    unCubes[i] = [];
    for(let j = 0; j < 3; j++) {
        cubes[i][j] = [];
        unCubes[i][j] = [];
        for(let k = 0; k<3; k++){
            unCubes[i][j][k] = null;
        }
    }
}

function init(){
    const cube000 = new Cube(size, gray, white, gray, yellow, gray, green,-1,-1,-1);
    const cube001 = new Cube(size, gray,white,gray,yellow,gray,gray,-1,-1,0);
    const cube002 = new Cube(size, gray,white,gray,yellow,orange,gray, -1,-1,1);
    const cube010 = new Cube(size, gray, white,gray,gray,gray,green, -1,0,-1);
    const cube011 = new Cube(size, gray, white,gray,gray,gray,gray,-1,0,0);
    const cube012 = new Cube(size, gray, white,gray,gray,orange,gray,-1,0,1);
    const cube020 = new Cube(size, gray, white,red,gray,gray,green,-1,1,-1);
    const cube021 = new Cube(size, gray, white,red,gray,gray,gray,-1,1,0);
    const cube022 = new Cube(size, gray, white,red,gray,orange,gray,-1,1,1);
    const cube100 = new Cube(size, gray, gray, gray, yellow, gray, green,0,-1,-1);
    const cube101 = new Cube(size, gray, gray, gray, yellow, gray, gray,0,-1,0);
    const cube102 = new Cube(size, gray, gray, gray, yellow, orange, gray,0,-1,1);
    const cube110 = new Cube(size, gray, gray, gray, gray, gray, green,0,0,-1);
    const cube111 = new Cube(size, gray, gray, gray, gray, gray, gray,0,0,0);
    const cube112 = new Cube(size, gray, gray, gray, gray, orange, gray,0,0,1);
    const cube120 = new Cube(size, gray, gray, red, gray, gray, green,0,1,-1);
    const cube121 = new Cube(size, gray, gray, red, gray, gray, gray,0,1,0);
    const cube122 = new Cube(size, gray, gray, red, gray, orange, gray,0,1,1);
    const cube200 = new Cube(size, blue, gray, gray, yellow, gray, green,1,-1,-1);
    const cube201 = new Cube(size, blue, gray, gray, yellow, gray, gray,1,-1,0);
    const cube202 = new Cube(size, blue, gray, gray, yellow, orange, gray,1,-1,1);
    const cube210 = new Cube(size, blue, gray, gray, gray, gray, green,1,0,-1);
    const cube211 = new Cube(size, blue, gray, gray, gray, gray, gray,1,0,0);
    const cube212 = new Cube(size, blue, gray, gray, gray, orange, gray,1,0,1);
    const cube220 = new Cube(size, blue, gray, red, gray, gray, green,1,1,-1);
    const cube221 = new Cube(size, blue, gray, red, gray, gray, gray,1,1,0);
    const cube222 = new Cube(size, blue, gray, red, gray, orange, gray,1,1,1);
    cubes[0][0].push(cube000);
    cubes[0][0].push(cube001);
    cubes[0][0].push(cube002);
    cubes[0][1].push(cube010);
    cubes[0][1].push(cube011);
    cubes[0][1].push(cube012);
    cubes[0][2].push(cube020);
    cubes[0][2].push(cube021);
    cubes[0][2].push(cube022);
    cubes[1][0].push(cube100);
    cubes[1][0].push(cube101);
    cubes[1][0].push(cube102);
    cubes[1][1].push(cube110);
    cubes[1][1].push(cube111);
    cubes[1][1].push(cube112);
    cubes[1][2].push(cube120);
    cubes[1][2].push(cube121);
    cubes[1][2].push(cube122);
    cubes[2][0].push(cube200);
    cubes[2][0].push(cube201);
    cubes[2][0].push(cube202);
    cubes[2][1].push(cube210);
    cubes[2][1].push(cube211);
    cubes[2][1].push(cube212);
    cubes[2][2].push(cube220);
    cubes[2][2].push(cube221);
    cubes[2][2].push(cube222);
    for(const x of cubes){
        for(const y of x){
            for(const z of y){
                flatCubes.push(z);
                scene.add(z);
            }
        }
    }
}
function animate(){
    if(!isDragging){
        for(const x of cubes){
            for(const y of x){
                for(const z of y){
                    z.autoRotate();
                }
            }
        }

    }
    
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}

init();
animate();