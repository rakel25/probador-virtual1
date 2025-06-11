const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');

const camisetas = [];
const nombres = ['azul.png', 'morada.png', 'naranja.png', 'verde.png'];

let camisetaActual = 0;
let cargadas = 0;

nombres.forEach((nombre, i) => {
  camisetas[i] = new Image();
  camisetas[i].src = `camisetas/${nombre}`;
  camisetas[i].onload = () => {
    cargadas++;
    if (cargadas === nombres.length) {
      iniciarCamara();
    }
  };
});

function cambiarCamiseta(index) {
  camisetaActual = index;
}

function iniciarCamara() {
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

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    const leftShoulder = results.poseLandmarks[11];
    const rightShoulder = results.poseLandmarks[12];
    const leftHip = results.poseLandmarks[23];
    const rightHip = results.poseLandmarks[24];

    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const topX = leftShoulder.x * canvasElement.width;
      const topY = leftShoulder.y * canvasElement.height;
      const width = (rightShoulder.x - leftShoulder.x) * canvasElement.width * 1.6;
      const height = ((leftHip.y + rightHip.y) / 2 - (leftShoulder.y + rightShoulder.y) / 2) * canvasElement.height * 1.3;

      const drawX = topX - width * 0.25;
      const drawY = topY;

      canvasCtx.drawImage(camisetas[camisetaActual], drawX, drawY, width, height);
    }
  }
}
