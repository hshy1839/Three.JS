var selectedObject = null;
var moveDistance = 5;

var skinnedMesh;
var result;
var originalPosition = new THREE.Vector3();

function init() {

    // use the defaults
    var stats = initStats();
    var renderer = initRenderer();
    var camera = initCamera(new THREE.Vector3(0, 20, 120));
    var trackballControls = initTrackballControls(camera, renderer);
    var clock = new THREE.Clock();
    var object = [];
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    // and add some simple default lights
    var scene = new THREE.Scene();
    initDefaultLighting(scene);

    var gui = new dat.GUI();
    var controls = {
        normalScaleX: 1,
        normalScaleY: 1
    };

    var urls = [
        '../../assets/textures/cubemap/colloseum/right.png',
        '../../assets/textures/cubemap/colloseum/left.png',
        '../../assets/textures/cubemap/colloseum/top.png',
        '../../assets/textures/cubemap/colloseum/bottom.png',
        '../../assets/textures/cubemap/colloseum/front.png',
        '../../assets/textures/cubemap/colloseum/back.png'
    ];

    var cubeLoader = new THREE.CubeTextureLoader();
    var textureLoader = new THREE.TextureLoader();
    var cubeMap = cubeLoader.load(urls);
    scene.background = cubeMap;

    var cubeMaterial = new THREE.MeshStandardMaterial({
        envMap: cubeMap,
        color: 0xffffff,
        metalness: 1,
        roughness: 0,
    });

    var sphereMaterial = cubeMaterial.clone();
    sphereMaterial.normalMap = textureLoader.load("../../assets/textures/engraved/Engraved_Metal_003_NORM.jpg");
    sphereMaterial.aoMap = textureLoader.load("../../assets/textures/engraved/Engraved_Metal_003_OCC.jpg");
    sphereMaterial.shininessMap = textureLoader.load("../../assets/textures/engraved/Engraved_Metal_003_ROUGH.jpg");

    var cubeCamera = new THREE.CubeCamera(0.1, 100, 512);
    scene.add(cubeCamera);

    var cube = new THREE.CubeGeometry(26, 22, 12)
    var cube1 = addGeometryWithMaterial(scene, cube, 'cube', gui, controls, cubeMaterial);
    object.push(cube1);
    cube1.name = 'cube';
    cube1.position.x = -15;
    cube1.rotation.y = -1 / 3 * Math.PI;
    cubeCamera.position.copy(cube1.position);
    cubeMaterial.envMap = cubeCamera.renderTarget;

    var sphere = new THREE.SphereGeometry(5, 50, 50)
    var sphere1 = addGeometryWithMaterial(scene, sphere, 'sphere', gui, controls, sphereMaterial);
    sphere1.position.x = 15;
    object.push(sphere1);
    sphere1.name = 'sphere';

    var mixer = new THREE.AnimationMixer();
    var sceneContainer = new THREE.Scene();
    var clipAction
    var animationClip
    var mesh
    var controls
    var mixerControls = {
        time: 0,
        timeScale: 1,
        stopAllAction: function () { mixer.stopAllAction() },
    }
    var result;
    initDefaultLighting(scene);
    var loader = new THREE.FBXLoader();
    loader.load('../../assets/models/salsa/salsa.fbx', function (loadedresult) {

        result = loadedresult;
        // // correctly position the scene
        result.scale.set(0.2, 0.2, 0.2);
        result.translateY(-13);
        result.translateX(13);
        result.translateZ(-43);
        // result.scene.translateY(-3);
        // result.scene.rotateY(-0.3*Math.PI)

        scene.add(result)
        object.push(result);


        // // setup the mixer
        mixer = new THREE.AnimationMixer(result);
        animationClip = result.animations[0];
        clipAction = mixer.clipAction(animationClip).play();
        animationClip = clipAction.getClip();

        // // add the animation controls
        enableControls(mixer, mixerControls);
    });

    var mixer2 = new THREE.AnimationMixer();
    var clipAction2
    var animationClip2
    var controls2
    var mixerControls2 = {
        time: 0,
        timeScale: 1,
        stopAllAction: function () { mixer2.stopAllAction() },
    }

    var loader2 = new THREE.SEA3D({
        container: sceneContainer
    });
    loader2.load('../../assets/models/mascot/mascot.sea');
    loader2.onComplete = function (e) {
        skinnedMesh = sceneContainer.children[0];
        skinnedMesh.scale.set(0.1, 0.1, 0.1);
        skinnedMesh.translateX(20);
        skinnedMesh.translateY(-20);
        skinnedMesh.translateZ(-70);
        skinnedMesh.rotateY(-0.2 * Math.PI);

        scene.add(skinnedMesh);
        object.push(skinnedMesh);

        // and set up the animation
        mixer2 = new THREE.AnimationMixer(skinnedMesh);
        animationClip2 = skinnedMesh.animations[0].clip;
        clipAction2 = mixer2.clipAction(animationClip2).play();
        animationClip2 = clipAction2.getClip();
    };

    function enableControls() {
        var gui = new dat.GUI();
        var mixerFolder = gui.addFolder("AnimationMixer1");
        mixerFolder.add(mixerControls, "time").listen();
        mixerFolder.add(mixerControls, "timeScale", 0, 5).onChange(function (timeScale) { mixer.timeScale = timeScale });
        mixerFolder.add(mixerControls, "stopAllAction").listen();

        var mixerFolder2 = gui.addFolder("AnimationMixer2");
        mixerFolder2.add(mixerControls2, "time").listen();
        mixerFolder2.add(mixerControls2, "timeScale", 0, 5).onChange(function (timeScale) { mixer2.timeScale = timeScale });
        mixerFolder2.add(mixerControls2, "stopAllAction").listen();

        controls = { time: 0, effectiveTimeScale: 1, effectiveWeight: 1 }; // Define controls object as needed
        // Add controls manually to GUI
        gui.add(controls, "time").listen();
        gui.add(controls, "effectiveTimeScale").listen();
        gui.add(controls, "effectiveWeight").listen();

    }


    // 클릭 이벤트 리스너 등록
    document.addEventListener('click', onDocumentClick, false);

    // 키 다운 이벤트 리스너 등록
    document.addEventListener('keydown', onDocumentKeyDown, false);

    function onDocumentClick(event) {
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(object, true);

        if (intersects.length > 0) {
            if (intersects[0].object.name === 'cube' || intersects[0].object.name === 'sphere') {
                selectedObject = intersects[0].object;
                alert("Selected Object: " + selectedObject.name);
            } else if (intersects[0].object.name === 'Concha' || intersects[0].object.name === 'Mascot') {
                // Concha와 Mascot을 합친 skinnedMesh로 selectedObject 설정
                selectedObject = skinnedMesh;
                alert("Selected Object: skinnedMesh");
            } else if (intersects[0].object.name === 'Beta_Surface' || intersects[0].object.name === 'Beta_Joints') {
                // 다른 객체를 선택한 경우
                selectedObject = result;
                alert("Selected Object: result");
            }
        }
    }


    function onDocumentKeyDown(event) {

        if (selectedObject) {
            var keyCode = event.which;
            originalPosition.copy(selectedObject.position);

            switch (keyCode) {
                case 37: // Left arrow key
                    selectedObject.position.x -= moveDistance;
                    console.log("left");
                    break;
                case 38: // Up arrow key
                    selectedObject.position.z -= moveDistance;
                    break;
                case 39: // Right arrow key
                    selectedObject.position.x += moveDistance;
                    break;
                case 40: // Down arrow key
                    selectedObject.position.z += moveDistance;
                    break;
            }
            if (checkCollision(selectedObject, skinnedMesh) ||
                checkCollision(selectedObject, result) ||
                checkCollision(selectedObject, cube1) ||
                checkCollision(selectedObject, sphere1)) {
                // 충돌이 감지되면 이동 취소
                console.log("break")
            }

        }

    }

    function checkCollision(object1, object2) {
        var box1 = new THREE.Box3().setFromObject(object1);
        var box2 = new THREE.Box3().setFromObject(object2);
        return box1.intersectsBox(box2);
    }




    render();
    function render() {
        stats.update();
        var delta = clock.getDelta();
        trackballControls.update(clock.getDelta());

        cube1.visible = false;
        cubeCamera.updateCubeMap(renderer, scene);
        cube1.visible = true;

        requestAnimationFrame(render);
        renderer.render(scene, camera);
        cube1.rotation.y += 0.01;
        sphere1.rotation.y -= 0.01;
        if (mixer && clipAction && controls) {
            mixer.update(delta);
            controls.time = mixer.time;
            controls.effectiveTimeScale = clipAction.getEffectiveTimeScale();
            controls.effectiveWeight = clipAction.getEffectiveWeight();
        }
        if (mixer2 && clipAction2 && controls) {
            mixer2.update(delta);
            controls.time = mixer2.time;
            controls.effectiveTimeScale = clipAction2.getEffectiveTimeScale();
            controls.effectiveWeight = clipAction2.getEffectiveWeight();
        }
    }
}