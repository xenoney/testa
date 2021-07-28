
//import * as THREE from '../build/three.module.js';

//import { OutlineEffect } from './jsm/effects/OutlineEffect.js';
//import { MMDLoader } from './jsm/loaders/MMDLoader.js';
//import { MMDAnimationHelper } from './jsm/animation/MMDAnimationHelper.js';

let mesh, camera, scene, renderer, effect, composer;
let helper;

let ready = false;

const clock = new THREE.Clock();

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
    Ammo().then(() => {
        init();
        // setupPhysicsWorld();
        animate();
    });
});

function setupPhysicsWorld(){
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    let physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}

function initLoadingManager() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const id = setInterval(frame, 10);
    let width = 0;
    let percentComplete = 0;

    function frame() {
        if (width < percentComplete) {
            width += 1;
            progressBar.style.width = width + '%';
            progressText.textContent = width;
        } else if (width >= 100) {
            document.getElementById('overlay').remove();
            clearInterval(id)
            ready = true;
        }
    }

    const manager = new THREE.LoadingManager();

    manager.onStart = (url, itemsLoaded, itemsTotal) => {
        document.getElementById('startButton').remove();
        document.getElementById('loadingContainer').classList.remove('none');
        console.log(`Started loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`);
    };

    manager.onLoad = () => {
        console.log('Loading complete!');
    };

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        percentComplete = Math.round((itemsLoaded / itemsTotal * 100 + Number.EPSILON) * 100) / 100;
        console.log(`Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`);
    };

    return manager;
}

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    // camera.position.set(0, 3, 45);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Scene

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);

    // scene.add(new THREE.GridHelper(100, 10));

    const listener = new THREE.AudioListener();
    camera.add(listener);
    scene.add(camera);

    const ambient = new THREE.AmbientLight(0x999999);
    scene.add(ambient);

    const directionalLight = new THREE.DirectionalLight(0x887766);
    directionalLight.position.set(-1, 1, 1).normalize();
    scene.add(directionalLight);

    // Renderer

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    effect = new THREE.OutlineEffect(renderer);

    // Ground
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 50),
        new THREE.MeshPhongMaterial({specular: 0xffffff})
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.0001;
    plane.receiveShadow = true;
    scene.add( plane );

    // let scene2 = new THREE.Scene();
    // let renderer2 = new THREE.WebGLRenderer({ antialias: true });
    // renderer2.setPixelRatio(window.devicePixelRatio);
    // renderer2.setSize(window.innerWidth, window.innerHeight);

    let geometry = new THREE.PlaneBufferGeometry(100, 100);
    let groundReflector = new THREE.ReflectorForSSRPass(geometry, {
        clipBias: 0.0003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        // color: 0xffffff,
        color: 0x777777,
        useDepthTexture: true,
    });
    groundReflector.material.depthWrite = false;
    groundReflector.rotation.x = -Math.PI / 2;
    // groundReflector.opacity = 1;
    // groundReflector.visible = false;
    scene.add(groundReflector);

    // let groundMirror = new THREE.Reflector(geometry, {
    //     clipBias: 0.003,
    //     textureWidth: window.innerWidth * window.devicePixelRatio,
    //     textureHeight: window.innerHeight * window.devicePixelRatio,
    //     color: 0x777777
    // });
    // // groundMirror.position.y = 0.5;
    // groundMirror.rotateX(-Math.PI / 2);
    // scene.add(groundMirror);

    const selects = [];
    composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    // composer.renderToScreen = true;
    // renderer.outputEncoding = THREE.sRGBEncoding;

    let ssrPass = new THREE.SSRPass({
        renderer,
        scene,
        camera,
        // width: window.innerWidth,
        // height: window.innerHeight,
        width: innerWidth,
        height: innerHeight,
        // encoding: THREE.sRGBEncoding,
        groundReflector: groundReflector,
        // selects: params.groundReflector ? selects : null
        selects: selects
    });
    ssrPass.maxDistance = 12.5;
    groundReflector.maxDistance = ssrPass.maxDistance;
    ssrPass.opacity = .3;
    groundReflector.opacity = ssrPass.opacity;

    composer.addPass(ssrPass);

    // Model

    function onProgress(xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = xhr.loaded / xhr.total * 100;
            // console.log(Math.round(percentComplete) + '% downloaded');
        }
    }

    const manager = initLoadingManager();
    const modelFile = 'res/models/klee/klee.pmx';
    // const vmdFiles = ['res/mmd/vmds/wavefile_v2.vmd'];
    // const cameraFiles = ['res/mmd/vmds/wavefile_camera.vmd'];
    // const audioFile = 'res/mmd/audios/wavefile_short.mp3';
    // const audioParams = {delayTime: 160 * 1 / 30};
    const modelFile2 = 'res/models/qiqi/qiqi.pmx';
    const modelFile3 = 'res/models/diona/diona.pmx';
    const vmdFiles1 = ['res/audio-mc/pico/Motion-Camera/MIDDLE.vmd'];
    const vmdFiles2 = ['res/audio-mc/pico/Motion-Camera/LEFT.vmd'];
    const vmdFiles3 = ['res/audio-mc/pico/Motion-Camera/RIGHT.vmd'];
    const cameraFiles = ['res/audio-mc/pico/Motion-Camera/camera.vmd'];
    const audioFile = 'res/audio-mc/pico/audios/pico.mp3';
    const audioParams = {};

    helper = new THREE.MMDAnimationHelper();
    const loader = new THREE.MMDLoader(manager);
    const audioLoader = new THREE.AudioLoader(manager);

    function loadModel(modelFile, vmdFiles) {
        loader.loadWithAnimation(modelFile, vmdFiles, (mmd) => {
            mesh = mmd.mesh;
            mesh.scale.set(1, 1, 1);
            for (let material of mesh.material) {
                material.userData.outlineParameters.thickness = 0.001;
            }
            helper.add(mesh, {
                animation: mmd.animation,
                physics: true
            });
            scene.add(mesh);
            selects.push(mesh);
        }, onProgress, null);
    }

    loadModel(modelFile, vmdFiles1);
    loadModel(modelFile2, vmdFiles2);
    loadModel(modelFile3, vmdFiles3);

    loader.loadAnimation(cameraFiles, camera, (cameraAnimation) => {
        helper.add(camera, {
            animation: cameraAnimation
        });
    }, onProgress, null);

    audioLoader.load(audioFile, (buffer) => {
        const audio = new THREE.Audio(listener).setBuffer(buffer);
        helper.add(audio, audioParams);
    }, onProgress, null);

    //

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    if (ready) {
        helper.update(clock.getDelta());
    }
    composer.render();
    // effect.render(scene, camera);
}
