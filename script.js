const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const nombreCamiseta = document.getElementById('nombreCamiseta');

const prendas = [
  { nombre: "Peixe Shirt", src: "camisetas/peixe.png" },
  { nombre: "Moria Skirt", src: "camisetas/moria.png" },
  { nombre: "Nusa Trouser", src: "camisetas/nusa.png" },
  { nombre: "Jacket", src: "camisetas/jacket.png" }
];

let indice = 0;
const imagenes = prendas.map(p => {
  const img = new Image();
  img.src = p.src;
  return img;
});

function cambiarCamiseta(direccion) {
  indice = (indice + direccion + prendas.length) % prendas.length;
  nombreCamiseta.textContent = prendas[indice].nombre;
}

// Cámara
let useFrontCamera = true;
let camera;

function iniciarCamara() {
  if (camera) camera.stop();

  camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480,
    facingMode: useFrontCamera ? 'user' : 'environment'
  });
  camera.start();
}

function cambiarCamara() {
  useFrontCamera = !useFrontCamera;
  iniciarCamara();
}

function onResults(results) {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    const ls = results.poseLandmarks[11]; // left shoulder
    const rs = results.poseLandmarks[12]; // right shoulder
    const lh = results.poseLandmarks[23]; // left hip

    // Calculamos ancho y alto para la camiseta (ajustado a torso)
    const ancho = (rs.x - ls.x) * canvasElement.width * 1.5;
    const alto = (lh.y - ls.y) * canvasElement.height * 1.6;

    // Posición (bajo el cuello, en hombro izquierdo)
    const x = ls.x * canvasElement.width - ancho * 0.15;
    const y = ls.y * canvasElement.height - alto * 0.25;

    canvasCtx.drawImage(imagenes[indice], x, y, ancho, alto);
  }

  canvasCtx.restore();
}

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(onResults);

iniciarCamara(); // iniciar con cámara frontal
