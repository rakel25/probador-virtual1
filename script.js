const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');

const camisetas = [
  new Image(),
  new Image(),
  new Image(),
  new Image()
];

const nombres = ['azul.png', 'morada.png', 'naranja.png', 'verde.png'];
let cargadas = 0;

nombres.forEach((nombre, index) => {
  camisetas[index].src = `camisetas/${nombre}`;
  camisetas[index].onload = () => {
    cargadas++;
    if (cargadas === camisetas.length) {
      iniciarCamara();
    }
  };
});

let camisetaActual = 0;
function cambiarCamiseta(index) {
  camisetaActual = index;
}

function iniciarCamara() {
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  pose.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480
  });

  camera.start();
}

function onResults(results) {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    const leftShoulder = results.poseLandmarks[11];
    const rightShoulder = results.poseLandmarks[12];

    if (leftShoulder && rightShoulder) {
      const x = leftShoulder.x * canvasElement.width;
      const y = leftShoulder.y * canvasElement.height;
      const width = (rightShoulder.x - leftShoulder.x) * canvasElement.width;
      const height = width * 1.2;

      canvasCtx.drawImage(camisetas[camisetaActual], x, y, width, height);
    }
  }

  canvasCtx.restore();
}
