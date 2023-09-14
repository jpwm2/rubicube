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
    const vector = intersectObjects[0].face.normal;
    if (!axleLock){
        if (Math.abs(xAxle.dot(vector)) < 1e-6){
            if (Math.abs(yAxle.dot(vector)) < 1e-6){
                if (Math.abs(vectorRelationship(xAxle, delta)) < 0.5){
                    axle = 1;
                }else{
                    axle = 0;
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
        axleLock = true;
    }
    delta.multiplyScalar(0.005);
    if(axle == 0){
        for(let y = 0;y < 3;y++){
            for(let z = 0; z < 3; z++){
                cubes[selectedX][y][z].rotate(delta.x,0,0)
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

class Cube extends THREE.Mesh{
    constructor(size,color0, color1, color2, color3, color4, color5, x, y, z){
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
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.rx0 = Math.sqrt(y*y + z*z);
        this.ry0 = Math.sqrt(x*x + z*z);
        this.rz0 = Math.sqrt(x*x + y*y);
        this.rx1 = Math.atan(y,z);
        this.ry1 = Math.atan(x,z);
        this.rz1 = Math.atan(y,z);
    }

    rotate(rx,ry,rz){
        this.rotation.x += rx;
        this.rotation.y -= ry;
        this.rotation.z += rz;
        this.rx += rx;
        this.ry += ry;
        this.rz += rz;
        this.position.y = Math.cos(rx) * this.position.y - Math.sin(rx) * this.position.z;
        this.position.z = Math.sin(rx) * this.position.y + Math.cos(rx) * this.position.z;
        this.position.x = Math.cos(ry) * this.position.x - Math.sin(ry) * this.position.z;
        this.position.z = Math.sin(ry) * this.position.x + Math.cos(ry) * this.position.z;
        this.position.x = Math.cos(rz) * this.position.x - Math.sin(rz) * this.position.y;
        this.position.y = Math.sin(rz) * this.position.x + Math.cos(rz) * this.position.y;

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


const cubes = [];
const flatCubes =[];

for(let i = 0; i < 3; i++) {
    cubes[i] = [];
    for(let j = 0; j < 3; j++) {
        cubes[i][j] = [];
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
    cubes[0][0][0].rotate(0.1,0,0);
    cubes[0][0][1].rotate(0.1,0,0);
    cubes[0][0][2].rotate(0.1,0,0);
    cubes[0][1][0].rotate(0.1,0,0);
    cubes[0][1][1].rotate(0.1,0,0);
    cubes[0][1][2].rotate(0.1,0,0);
    cubes[0][2][0].rotate(0.1,0,0);
    cubes[0][2][1].rotate(0.1,0,0);
    cubes[0][2][2].rotate(0.1,0,0);
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}

init();
animate();