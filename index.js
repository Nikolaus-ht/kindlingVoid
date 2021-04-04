import * as THREE from "./three.js-dev/build/three.module.js"
import { OrbitControls } from "./three.js-dev/examples/jsm/controls/OrbitControls.js"
import { FBXLoader } from "./three.js-dev/examples/jsm/loaders/FBXLoader.js"

//Declare variable
let thirdPersonCamera, scene, renderer, firstPersonCamera, aLight, dLight, controls, nowCam, mixCylPlay, sLight, shadowBro, mixShadow
let pLight, mixFire
let tLoader = new THREE.TextureLoader()
let loadText = new THREE.FontLoader()
let treeLoader = new FBXLoader()



//Basic Set Up
let init = () => {
    scene = new THREE.Scene()

    let fov = 75
    let w = window.innerWidth
    let h = window.innerHeight
    let aspect = w / h
    let near = 0.1
    let far = 10000
    thirdPersonCamera = new THREE.PerspectiveCamera(fov, aspect)
    thirdPersonCamera.position.set(0, 30, 50)
    thirdPersonCamera.lookAt(0, 0, 0)

    firstPersonCamera = new THREE.PerspectiveCamera(fov)
    firstPersonCamera.position.set(0, 1, 20)
    firstPersonCamera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(w, h)
    renderer.setPixelRatio(devicePixelRatio)
    document.body.appendChild(renderer.domElement)

    //Orbit Controls
    controls = new OrbitControls(thirdPersonCamera, renderer.domElement)

    nowCam = thirdPersonCamera
}


//Object
let createObject = () => {
    //Cone
    let gCone = new THREE.ConeGeometry(40, 20)

    let tCone = new tLoader.load("./assets/dirt/base.jpg")
    let nCone = new tLoader.load("./assets/dirt/normal.jpg")

    let mCone = new THREE.MeshStandardMaterial({
        color: "#1F1616",
        map: tCone,
        normalMap: nCone
    }
    )

    let mixCone = new THREE.Mesh(gCone, mCone)
    mixCone.position.set(0, -10, 0)
    mixCone.rotation.setFromVector3(new THREE.Vector3(0, 0, Math.PI))
    mixCone.receiveShadow = true
    scene.add(mixCone)

    //Player
    let cylPlay = new THREE.CylinderGeometry(1, 1, 3, 32)
    let mCylPlay = new THREE.MeshStandardMaterial({
        color: "#FFFFFF"
    })

    mixCylPlay = new THREE.Mesh(cylPlay, mCylPlay)
    mixCylPlay.position.set(0, 1, 20)
    scene.add(mixCylPlay)

    //Text
    loadText.load("https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json",
        font => {
            let gText = new THREE.TextGeometry("Kindling Void", {
                font: font,
                size: 1,
                height: 0.3
            })

            let mixMesh = new THREE.Mesh(gText, new THREE.MeshStandardMaterial({
                color: 0xFFFFFFF
            }))

            mixMesh.position.set(-2.99, 0, 2)
            mixMesh.rotation.set(-0.5, 0, 0)
            mixMesh.castShadow = true
            mixMesh.receiveShadow = true
            scene.add(mixMesh)

        })

    //World Tree
    treeLoader.load("./assets/Red Oak/RedOak_High.fbx", function (object) {
        object.rotation.set(-1.5, 0, 0)
        object.position.set(0, -1, 0)
        object.scale.set(0.5, 0.5, 0.5)
        object.castShadow = true
        object.receiveShadow = true
        scene.add(object)
    })

}


//Fire Fly
let fireFly = () => {

    let sFire = new THREE.SphereGeometry()

    let mFire = new THREE.MeshStandardMaterial({
        color: "#FFF3D4",
    })

    mFire.Transparent = true
    mFire.opacity = 0.8
    let temp1, temp2, temp3
    for (let i = 0; i < 10; i++) {
        mixFire = new THREE.Mesh(sFire, mFire)
        mixFire.position.set(temp1 = Math.random() * 20 - 10, temp2 = Math.random() * 15 + 5, temp3 = Math.random() * 20 - 10)
        pLight = new THREE.PointLight("#FFF3D4", 10, 5)
        pLight.castShadow = true
        pLight.position.set(temp1, temp2, temp3)
        scene.add(pLight)
        mixFire.scale.set(0.1, 0.1, 0.1)

        //Pivot
        let pivot = new THREE.Group()
        pivot.position.set(temp1 + 1, temp2, temp3)
        scene.add(pivot)

        //Grouping
        let group = new THREE.Group()
        group.add(mixFire)
        group.add(pivot)
        group.add(pLight)
        scene.add(group)

        //Animasi Muter
        let animate = () => {
            requestAnimationFrame(animate)
            group.rotation.y += 0.07
            renderer.render(scene, nowCam)
        }
        animate()
    }



}

//EventListener
let keyListener = (event) => {
    let keyCode = event.keyCode

    //w
    if (keyCode == 87) {
        sLight.position.z -= 0.2
        mixShadow.position.z -= 0.2
        mixCylPlay.position.z -= 0.2
        firstPersonCamera.position.z -= 0.2
    }
    //s
    else if (keyCode == 83) {
        sLight.position.z += 0.2
        mixShadow.position.z += 0.2
        mixCylPlay.position.z += 0.2
        firstPersonCamera.position.z += 0.2
    }
    //a
    else if (keyCode == 65) {
        sLight.position.x -= 0.2
        mixShadow.position.x -= 0.2
        mixCylPlay.position.x -= 0.2
        firstPersonCamera.position.x -= 0.2
    }
    //d
    else if (keyCode == 68) {
        sLight.position.x += 0.2
        mixShadow.position.x += 0.2
        mixCylPlay.position.x += 0.2
        firstPersonCamera.position.x += 0.2
    }

    //space
    if (keyCode == 32) {
        nowCam = (nowCam == firstPersonCamera) ? thirdPersonCamera : firstPersonCamera
        renderer.render(scene, nowCam)
    }

}

let addListener = () => {
    document.addEventListener("keydown", keyListener)
}

//Skybox
//Sykbox sesuai persyratan pake cube mapping technique bukan cube texture loader
let box = () => {
    let theBox = new THREE.BoxGeometry(500, 500, 500)
    let theBoxMat = []
    let BoxTexture = [
        tLoader.load("./assets/skybox/px.png"),
        tLoader.load("./assets/skybox/nx.png"),
        tLoader.load("./assets/skybox/py.png"),
        tLoader.load("./assets/skybox/ny.png"),
        tLoader.load("./assets/skybox/pz.png"),
        tLoader.load("./assets/skybox/nz.png"),
    ]

    BoxTexture.forEach(texture => {
        theBoxMat.push(new THREE.MeshBasicMaterial({
            color: "#6B6A6A",
            map: texture,
            side: THREE.BackSide
        }))
    });

    let sBox = new THREE.Mesh(theBox, theBoxMat)
    scene.add(sBox)
}

//Light
let createLight = () => {
    aLight = new THREE.AmbientLight("#FFFFFF", 0.25)
    scene.add(aLight)

    dLight = new THREE.DirectionalLight("#FFFFFF", 0.25)
    dLight.castShadow = true
    dLight.position.set(0, 1, 0)
    scene.add(dLight)


    shadowBro = new THREE.SphereGeometry(1, 1)
    let mShadow = new THREE.MeshStandardMaterial({
        color: "#1F1616"
    }
    )

    mixShadow = new THREE.Mesh(shadowBro, mShadow)
    mixShadow.position.set(0, -2, 0)
    scene.add(mixShadow)

    sLight = new THREE.SpotLight("#FFFFFF", 4, undefined, 0.1)
    sLight.position.set(0, 1, 20)
    sLight.target = mixShadow
    sLight.castShadow = true
    scene.add(sLight)

}

//Render
let render = () => {
    renderer.render(scene, nowCam)
    requestAnimationFrame(render)
}

//Windows Resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    nowCam.aspect = window.innerWidth / window.innerHeight

    nowCam.updateProjectionMatrix();
})

//Load
window.onload = () => {
    init()
    addListener()
    fireFly()
    box()
    createLight()
    createObject()
    render()
}