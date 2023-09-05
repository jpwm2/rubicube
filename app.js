
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;


// ... その他の初期化 (カメラ、レンダラー、シーンなど)
let isDragging = false;
let isCube = false;
let prevMousePos = { x: 0, y: 0 };
let theta = 0; // 水平角
let phi = Math.PI / 2; // 垂直角
const radius = 5; // 原点からの距離

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null; 
let intersects =null;

let axle = null;
let axleLock = false;
const xAxle = new THREE.Vector3(1,0,0);
const yAxle = new THREE.Vector3(0,1,0);
const zAxle = new THREE.Vector3(0,0,1);
let dragDirection = new THREE.Vector3();
let where = null;
let rad = 0;
let x0rad = 0, x1rad = 0, x2rad = 0, y0rad = 0, y1rad = 0, y2rad = 0, z0rad = 0, z1rad = 0,z2rad = 0;


const cameraDistance = 1;

document.addEventListener('mousedown', (e) => {
    // マウスの位置を更新（これが以前のコードから抜けていました）
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(cubes);

    if (intersects.length > 0) {
        isCube = true;
        isDragging = true;
        selectedObject = intersects[0].object;
        console.log(cubes.indexOf(selectedObject))
        console.log('hello');
        
        prevMousePos.x = e.clientX;
        prevMousePos.y = e.clientY;

    
    } else { // 何もないところをクリックした場合の挙動
        console.log('Hi');
        isCube = false;
        isDragging = true;
        prevMousePos.x = e.clientX;
        prevMousePos.y = e.clientY;
    }
});


document.addEventListener('mouseup', () => {
    isDragging = false;
    axleLock = false;
    switch (where) {
        case 0:
          // whereが0の場合の処理
          x0rad = rad;
          console.log("where is 0");
          break;
        case 1:
            x1rad = rad;
          // whereが1の場合の処理
          console.log("where is 1");
          break;
        case 2:
            x2rad = rad;
          // whereが2の場合の処理
          console.log("where is 2");
          break;
        case 3:
            y0rad = rad;
          // whereが3の場合の処理
          console.log("where is 3");
          break;
        case 4:
            y1rad = rad;
          // whereが4の場合の処理
          console.log("where is 4");
          break;
        case 5:
            y2rad = rad;
          // whereが5の場合の処理
          console.log("where is 5");
          break;
        case 6:
            z0rad = rad;
          // whereが6の場合の処理
          console.log("where is 6");
          break;
        case 7:
            z1rad = rad;
          // whereが7の場合の処理
          console.log("where is 7");
          break;
        case 8:
            z2rad = rad;
          // whereが8の場合の処理
          console.log("where is 8");
          break;
        default:
          // whereが0-8以外の場合の処理
          console.log("where is out of range");
          break;
      }
    where = null;
    rad = 0;
      
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    if (isCube){
        dragDirection.x = e.clientX - prevMousePos.x;
        dragDirection.y = e.clientY - prevMousePos.y;
        dragDirection.z = 0;


        updateCubePosition();

        prevMousePos.x = e.clientX;
        prevMousePos.y = e.clientY;
    }else{
        console.log('helo?');

        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
    
        theta -= deltaX * 0.005;
        phi -= deltaY * 0.005;
    
        // phi の範囲を制約
        phi = Math.min(Math.max(0.1, phi), Math.PI - 0.1);
    
        updateCameraPosition();
    
        prevMousePos.x = e.clientX;
        prevMousePos.y = e.clientY;

    }
});


function updateCameraPosition() {
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 0, 0);
}

function updateCubePosition(){
    let vector = intersects[0].face.normal;
    let cubeId = cubes.indexOf(selectedObject);
    if (Math.abs(xAxle.dot(vector)) < 1e-6){
        if (Math.abs(yAxle.dot(vector)) < 1e-6){
            if (Math.abs(vectorRelationship(xAxle, dragDirection)) < 0.5){
                if (!axleLock){
                    axleLock = true;
                    axle = 0;
                }
                rotate(cubeId);
                console.log('xAxle');
            }else{
                if (!axleLock){
                    axleLock = true;
                    axle = 1;
                }
                rotate(cubeId);
                console.log('yAxle');
            }
        }else{
            if (Math.abs(vectorRelationship(xAxle, dragDirection)) < 0.5){
                if (!axleLock){
                    axleLock = true;
                    axle = 0;
                }
                rotate(cubeId);
                console.log('xAxle');
            }else{
                if (!axleLock){
                    axleLock = true;
                    axle = 2;
                }
                rotate(cubeId);
                console.log('zAxle');
            }
        }
    }else{
        if (Math.abs(vectorRelationship(xAxle, dragDirection)) < 0.5){
            if (!axleLock){
                axleLock = true;
                axle = 2;
            }
            rotate(cubeId);
            console.log('zAxle');
        }else{
            if (!axleLock){
                axleLock = true;
                axle = 1;
            }
            rotate(cubeId);
            console.log('yAxle');
        }
    }

    function vectorRelationship(A, B) {
        const dotProduct = A.dot(B);
        const magnitudeA = A.length();
        const magnitudeB = B.length();
        const cosTheta = dotProduct / (magnitudeA * magnitudeB);
        return cosTheta;
      }

    function rotate(cubeId){
        const speed = 0.001;
        if (axle == 0){
            const cubes0 = [18,19,20,21,22,23,24,25,26];
            const cubes1 = [9,10,11,12,13,14,15,16,17];
            const cubes2 = [0,1,2,3,4,5,6,7,8];
            let distance = dragDirection.y;
            if (cubes0.includes(cubeId)){
                console.log('areyouHappy?1');
                r(cubes0,distance,0);
            }else if(cubes1.includes(cubeId)){
                console.log('areyouHappy?2');
                r(cubes1,distance,1);
            }else{
                console.log('areyouHappy?3');
                r(cubes2,distance,2);
            }
        }else if(axle == 1){
            const cubes0 = [6,7,8,15,16,17,24,25,26];
            const cubes1 = [3,4,5,12,13,14,21,22,23];
            const cubes2 = [0,1,2,9,10,11,18,19,20];
            let distance = dragDirection.x;
            if (cubes0.includes(cubeId)){
                console.log('areyouOK?1');
                r(cubes0,distance,0);
            }else if(cubes1.includes(cubeId)){
                console.log('areyouOK?2');
                r(cubes1,distance,1);
            }else{
                console.log('areyouOK?3');
                r(cubes2,distance,2);
            }

        }else{
            const cubes0 = [2,5,8,11,14,17,20,23,26];
            const cubes1 = [1,4,7,10,13,16,19,22,25];
            const cubes2 = [0,3,6,9,12,15,18,21,24];
            let distance = dragDirection.y;
            if (cubes0.includes(cubeId)){
                console.log('happyhappyhappy1');
                r(cubes0,distance,0);
            }else if(cubes1.includes(cubeId)){
                console.log('happyhappyhappy2');
                r(cubes1,distance,1);
            }else{
                r(cubes2,distance,2);
                console.log('happyhappyhappy3');
            }
        }
        function r(rCubes,distance,line){
            const root2 = Math.sqrt(2);
            rad = distance * speed + rad;
            if (axle == 0){
                if(where == null){
                    if (line == 0){
                        rad = rad + x0rad;
                        where = 0;
                    }else if(line == 1){
                        rad = rad + x1rad;
                        where = 1;
                    }else{
                        rad = rad + x2rad;
                        where = 2;
                    }}
                    if (line == 0){
                        x0rad = rad;
                        if (x0rad * 2 / Math.PI % 1 == 0){
                            if (distance <0){
                                
                            }
                        }
                    }else if(line == 1){
                        x1rad = rad;
                        where = 1;
                    }else{
                        x2rad = rad;
                        where = 2;
                    }
                cubes[rCubes[8]].position.y = root2 * Math.sin(1*Math.PI/4 - rad);
                cubes[rCubes[8]].position.z = root2 * Math.cos(1*Math.PI/4 -rad);
                cubes[rCubes[8]].rotation.x = rad;

                cubes[rCubes[7]].position.y = Math.sin(Math.PI/2 - rad);
                cubes[rCubes[7]].position.z = Math.cos(Math.PI/2 -rad);
                cubes[rCubes[7]].rotation.x = rad;
                
                cubes[rCubes[6]].position.y = root2 * Math.sin(3*Math.PI/4 - rad);
                cubes[rCubes[6]].position.z = root2 * Math.cos(3*Math.PI/4 -rad);
                cubes[rCubes[6]].rotation.x = rad;

                cubes[rCubes[5]].position.y = Math.sin(2*Math.PI - rad);
                cubes[rCubes[5]].position.z = Math.cos(2*Math.PI -rad);
                cubes[rCubes[5]].rotation.x = rad;

                cubes[rCubes[4]].rotation.x = rad;

                cubes[rCubes[3]].position.y = Math.sin(Math.PI - rad);
                cubes[rCubes[3]].position.z = Math.cos(Math.PI -rad);
                cubes[rCubes[3]].rotation.x = rad;

                cubes[rCubes[2]].position.y = root2 * Math.sin(7*Math.PI/4 - rad);
                cubes[rCubes[2]].position.z = root2 * Math.cos(7*Math.PI/4 -rad);
                cubes[rCubes[2]].rotation.x = rad;

                cubes[rCubes[1]].position.y = Math.sin(3*Math.PI/2 - rad);
                cubes[rCubes[1]].position.z = Math.cos(3*Math.PI/2 -rad);
                cubes[rCubes[1]].rotation.x = rad;

                cubes[rCubes[0]].position.y = root2 * Math.sin(5*Math.PI/4 - rad);
                cubes[rCubes[0]].position.z = root2 * Math.cos(5*Math.PI/4 -rad);
                cubes[rCubes[0]].rotation.x = rad;
            }else if(axle == 1){
                if(where == null){
                    if (line == 0){
                        rad = rad + y0rad;
                        where = 3;
                    }else if(line == 1){
                        rad = rad + y1rad;
                        where = 4;
                    }else{
                        rad = rad + y2rad;
                        where = 5;
                    }}
                    if (line == 0){
                        y0rad = rad;
                    }else if(line == 1){
                        y1rad = rad;
                    }else{
                        y2rad = rad;
                    }
                cubes[rCubes[8]].position.x = root2 * Math.sin(1*Math.PI/4 + rad);
                cubes[rCubes[8]].position.z = root2 * Math.cos(1*Math.PI/4 + rad);
                cubes[rCubes[8]].rotation.y = rad;
                
                cubes[rCubes[7]].position.x = Math.sin(Math.PI/2 + rad);
                cubes[rCubes[7]].position.z = Math.cos(Math.PI/2 + rad);
                cubes[rCubes[7]].rotation.y = rad;

                cubes[rCubes[6]].position.x = root2 * Math.sin(3*Math.PI/4 + rad);
                cubes[rCubes[6]].position.z = root2 * Math.cos(3*Math.PI/4 + rad);
                cubes[rCubes[6]].rotation.y = rad;
                
                cubes[rCubes[5]].position.x = Math.sin(2*Math.PI + rad);
                cubes[rCubes[5]].position.z = Math.cos(2*Math.PI + rad);
                cubes[rCubes[5]].rotation.y = rad;

                cubes[rCubes[4]].rotation.y = rad;
                
                cubes[rCubes[3]].position.x = Math.sin(Math.PI + rad);
                cubes[rCubes[3]].position.z = Math.cos(Math.PI + rad);
                cubes[rCubes[3]].rotation.y = rad;
                
                cubes[rCubes[2]].position.x = root2 * Math.sin(7*Math.PI/4 + rad);
                cubes[rCubes[2]].position.z = root2 * Math.cos(7*Math.PI/4 + rad);
                cubes[rCubes[2]].rotation.y = rad;
                
                cubes[rCubes[1]].position.x = Math.sin(3*Math.PI/2 + rad);
                cubes[rCubes[1]].position.z = Math.cos(3*Math.PI/2 + rad);
                cubes[rCubes[1]].rotation.y = rad;
                
                cubes[rCubes[0]].position.x = root2 * Math.sin(5*Math.PI/4 + rad);
                cubes[rCubes[0]].position.z = root2 * Math.cos(5*Math.PI/4 + rad);
                cubes[rCubes[0]].rotation.y = rad;
            }else{
                if(where == null){
                    if (line == 0){
                        rad = rad + z0rad;
                        where = 6;
                    }else if(line == 1){
                        rad = rad + z1rad;
                        where = 7;
                    }else{
                        rad = rad + z2rad;
                        where = 8;
                    }}
                    if (line == 0){
                        z0rad = rad;
                    }else if(line == 1){
                        z1rad = rad;
                    }else{
                        z2rad = rad;
                    }
                cubes[rCubes[8]].position.x = root2 * Math.sin(1*Math.PI/4 - rad);
                cubes[rCubes[8]].position.y = root2 * Math.cos(1*Math.PI/4 - rad);
                cubes[rCubes[8]].rotation.z = rad;
                
                cubes[rCubes[7]].position.x = Math.sin(Math.PI/2 - rad);
                cubes[rCubes[7]].position.y = Math.cos(Math.PI/2 - rad);
                cubes[rCubes[7]].rotation.z = rad;

                cubes[rCubes[6]].position.x = root2 * Math.sin(3*Math.PI/4 - rad);
                cubes[rCubes[6]].position.y = root2 * Math.cos(3*Math.PI/4 - rad);
                cubes[rCubes[6]].rotation.z = rad;
                
                cubes[rCubes[5]].position.x = Math.sin(2*Math.PI - rad);
                cubes[rCubes[5]].position.y = Math.cos(2*Math.PI - rad);
                cubes[rCubes[5]].rotation.z = rad;

                cubes[rCubes[4]].rotation.z = rad;
                
                cubes[rCubes[3]].position.x = Math.sin(Math.PI - rad);
                cubes[rCubes[3]].position.y = Math.cos(Math.PI - rad);
                cubes[rCubes[3]].rotation.z = rad;
                
                cubes[rCubes[2]].position.x = root2 * Math.sin(7*Math.PI/4 - rad);
                cubes[rCubes[2]].position.y = root2 * Math.cos(7*Math.PI/4 - rad);
                cubes[rCubes[2]].rotation.z = rad;
                
                cubes[rCubes[1]].position.x = Math.sin(3*Math.PI/2 - rad);
                cubes[rCubes[1]].position.y = Math.cos(3*Math.PI/2 - rad);
                cubes[rCubes[1]].rotation.z = rad;
                
                cubes[rCubes[0]].position.x = root2 * Math.sin(5*Math.PI/4 - rad);
                cubes[rCubes[0]].position.y = root2 * Math.cos(5*Math.PI/4 - rad);
                cubes[rCubes[0]].rotation.z = rad;
            }
        }
    }

}

function rotateCubes(){

}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const size = 0.98; // 1より少し小さい値を設定して、キューブ間にわずかな間隔を持たせます。
const geometry = new THREE.BoxGeometry(size, size, size);
const materials = [
  new THREE.MeshBasicMaterial({ color: 0xffffff }), // White
  new THREE.MeshBasicMaterial({ color: 0x00ff00}), // 
  new THREE.MeshBasicMaterial({ color: 0x0000ff}), // Blue
  new THREE.MeshBasicMaterial({ color: 0xffff00}), // Yellow
  new THREE.MeshBasicMaterial({ color: 0xff00ff}), //Magenta 
  new THREE.MeshBasicMaterial({ color: 0x00ffff}) //Cyan
  // ... 他の色も同様に追加
];



window.addEventListener('resize', function() {
    // カメラのアスペクト比を更新
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // レンダラのサイズを更新
    renderer.setSize(window.innerWidth, window.innerHeight);
});


const cube = new THREE.Mesh(geometry, materials);

const cubes = [];
for(let x = 0; x < 3; x++) {
  for(let y = 0; y < 3; y++) {
    for(let z = 0; z < 3; z++) {
      const cubeClone = cube.clone();
      cubeClone.position.set(x - 1, y - 1, z - 1); // -1をして中心に配置
      cubes.push(cubeClone);
      scene.add(cubeClone);
    }
  }
}
var s = 0;
var a = 0;


function animate() {
    // フレームごとのアップデートやアニメーションをここに記述
    cubes.forEach(function(cube){

    })    

    /*
    cubes[6].position.y = root2 * Math.sin(Math.PI/4+s);
    cubes[6].position.z = root2 * Math.sin(-Math.PI/4 + s);
    cubes[6].rotation.x = s; 
    cubes[7].position.y = Math.cos(-s);
    cubes[7].position.z = Math.sin(s);
    cubes[7].rotation.x = s;
    cubes[8].position.y = root2 * Math.cos(Math.PI/4 + s);
    cubes[8].position.z = root2 * Math.sin(Math.PI/4 + s);
    cubes[8].rotation.x = s;
    cubes[3].position.y = Math.sin(s);
    cubes[3].position.z = Math.cos(Math.PI + s);
    cubes[3].rotation.x = s;
    cubes[4].rotation.x = s;
    cubes[5].position.y = Math.sin(-s);
    cubes[5].position.z = Math.cos(s);
    cubes[5].rotation.x = s;
    cubes[0].position.y = root2 * Math.cos(Math.PI *3/ 4 - s);
    cubes[0].position.z = root2 * Math.cos(Math.PI * 3/4 + s);
    cubes[0].rotation.x = s;
    cubes[1].position.y = Math.cos(Math.PI + s);
    cubes[1].position.z = Math.sin(-s);
    cubes[1].rotation.x = s;
    cubes[2].position.y =  root2 * Math.cos(Math.PI*3/4 + s);
    cubes[2].position.z = root2 * Math.sin(Math.PI * 3/4 + s);
    cubes[2].rotation.x = s;

    
    cubes[24].position.y = root2 * Math.sin(Math.PI/4+s);
    cubes[24].position.z = root2 * Math.sin(-Math.PI/4 + s);
    cubes[24].rotation.x = s; 
    cubes[25].position.y = Math.cos(-s);
    cubes[25].position.z = Math.sin(s);
    cubes[25].rotation.x = s;
    cubes[26].position.y = root2 * Math.cos(Math.PI/4 + s);
    cubes[26].position.z = root2 * Math.sin(Math.PI/4 + s);
    cubes[26].rotation.x = s;
    cubes[21].position.y = Math.sin(s);
    cubes[21].position.z = Math.cos(Math.PI + s);
    cubes[21].rotation.x = s;
    cubes[22].rotation.x = s;
    cubes[23].position.y = Math.sin(-s);
    cubes[23].position.z = Math.cos(s);
    cubes[23].rotation.x = s;
    cubes[18].position.y = root2 * Math.cos(Math.PI *3/ 4 - s);
    cubes[18].position.z = root2 * Math.cos(Math.PI * 3/4 + s);
    cubes[18].rotation.x = s;
    cubes[19].position.y = Math.cos(Math.PI + s);
    cubes[19].position.z = Math.sin(-s);
    cubes[19].rotation.x = s;
    cubes[20].position.y =  root2 * Math.cos(Math.PI*3/4 + s);
    cubes[20].position.z = root2 * Math.sin(Math.PI * 3/4 + s);
    cubes[20].rotation.x = s;
    */

    // オブジェクトの回転など

    // 次の描画をリクエスト
    a += Math.PI/4096;
    s += Math.PI/128;
    requestAnimationFrame(animate);

    // シーンの描画
    renderer.render(scene, camera);
}

// アニメーションを開始
animate();
