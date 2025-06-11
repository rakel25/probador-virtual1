const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const nombreCamiseta = document.getElementById('nombreCamiseta');

const prendas = [
  {
    nombre: "Peixe Shirt",
    src: "camisetas/peixe.png",
    etiqueta: "camisetas/peixe_etiqueta.png"
  },
  {
    nombre: "Moria Skirt",
    src: "camisetas/moria.png",
    etiqueta: "camisetas/moria_etiqueta.png"
  },
  {
    nombre: "Nusa Trouser",
    src: "camisetas/nusa.png",
    etiqueta: "camisetas/nusa_etiqueta.png"
  },
  {
    nombre: "Jacket",
    src: "camisetas/jacket.png",
    etiqueta: "camisetas/jacket_etiqueta.png"
  }
];

let indice = 0;
const imagenes = prendas.map(p => {
  const img = new Image();
  img.src = p.src;
  return img;
});

const modal = document.getElementById('modalEtiqueta');
const imgModal = document.getElementById('imgEtiqueta');
const cerrarModal = document.getElementById('cerrarModal');

function cambiarCamiseta(direccion) {
  indice = (indice + direccion + prendas.length) % prendas.length;
  nombreCamiseta.textContent = prendas[indice].nombre;
}

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

  // Aplicar espejo solo a cámara frontal
  if (useFrontCamera) {
    videoElement.style.transform = 'scaleX(-1)';
  } else {
    videoElement.style.transform = 'scaleX(1)';
  }
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

  // Dibuja la cámara
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    const ls = results.poseLandmarks[11]; // left shoulder
    const rs = results.poseLandmarks[12]; // right shoulder
    const lh = results.poseLandmarks[23]; // left hip

    const ancho = (rs.x - ls.x) * canvasElement.width * 1.5;
    const alto = (lh.y - ls.y) * canvasElement.height * 1.6;

    const x = ls.x * canvasElement.width - ancho * 0.15;
    const y = ls.y * canvasElement.height - alto * 0.25;

    // Si cámara frontal, invertir eje X para que prenda no se dibuje invertida
    if (useFrontCamera) {
      canvasCtx.save();
      canvasCtx.scale(-1, 1);
      canvasCtx.drawImage(imagenes[indice], -x - ancho, y, ancho, alto);
      canvasCtx.restore();
    } else {
      canvasCtx.drawImage(imagenes[indice], x, y, ancho, alto);
    }
  }

  canvasCtx.restore();
}

let camera;
let useFrontCamera = true;

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

document.getElementById('btnAnterior').addEventListener('click', () => {
  cambiarCamiseta(-1);
});

document.getElementById('btnSiguiente').addEventListener('click', () => {
  cambiarCamiseta(1);
});

document.getElementById('btnCambiarCamara').addEventListener('click', () => {
  cambiarCamara();
});

// Al hacer clic en canvas (sobre la prenda) mostramos la etiqueta
canvasElement.addEventListener('click', (e) => {
  // Aquí para simplificar mostramos la etiqueta siempre para la prenda actual
  imgModal.src = prendas[indice].etiqueta;
  modal.style.display = 'flex';
});

cerrarModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Iniciar cámara y mostrar la prenda inicial
cambiarCamiseta(0);
iniciarCamara();
