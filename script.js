const splash = document.getElementById('splash');
const fittingRoom = document.getElementById('fittingRoom');
const startBtn = document.getElementById('startBtn');
const videoElement = document.getElementById('video');
const videoCanvas = document.getElementById('videoCanvas');
const clothingCanvas = document.getElementById('clothingCanvas');
const clothingImg = document.getElementById('clothingImg');
const selector = document.getElementById('clothingSelector');

const videoCtx = videoCanvas.getContext('2d');
const clothingCtx = clothingCanvas.getContext('2d');

function resizeCanvases() {
  videoCanvas.width = window.innerWidth;
  videoCanvas.height = window.innerHeight;
  clothingCanvas.width = window.innerWidth;
  clothingCanvas.height = window.innerHeight;
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

startBtn.onclick = () => {
  splash.style.display = 'none';
  fittingRoom.style.display = 'block';
  initCameraAndPose();
};

selector.addEventListener('change', () => {
  const selected = selector.value;
  clothingImg.src = `clothes/${selected}.png`;
});

// Inicializamos pose y cámara
function initCameraAndPose() {
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

// Dibuja el vídeo en videoCanvas y la prenda en clothingCanvas
function onResults(results) {
  // Video en el canvas de video
  videoCtx.save();
  videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
  videoCtx.drawImage(results.image, 0, 0, videoCanvas.width, videoCanvas.height);
  videoCtx.restore();

  // Limpia canvas de ropa
  clothingCtx.clearRect(0, 0, clothingCanvas.width, clothingCanvas.height);

  if (!results.poseLandmarks) return;

  // Usamos hombros y torso para posicionar prenda
  const leftShoulder = results.poseLandmarks[11];
  const rightShoulder = results.poseLandmarks[12];
  const leftHip = results.poseLandmarks[23];
  const rightHip = results.poseLandmarks[24];

  // Centro entre hombros
  const centerX = (leftShoulder.x + rightShoulder.x) / 2 * clothingCanvas.width;
  const centerY = (leftShoulder.y + rightShoulder.y) / 2 * clothingCanvas.height;

  // Anchura entre hombros
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x) * clothingCanvas.width;

  // Altura entre hombros y cadera para escala vertical
  const torsoHeight = Math.abs(((leftHip.y + rightHip.y) / 2 - (leftShoulder.y + rightShoulder.y) / 2)) * clothingCanvas.height;

  // Ajustamos tamaño de la prenda
  const width = shoulderWidth * 1.8;
  const height = torsoHeight * 1.8;

  // Dibujamos la prenda centrada en el torso
  clothingCtx.drawImage(
    clothingImg,
    centerX - width / 2,
    centerY - height / 3, // un poco más arriba para que quede encima del torso
    width,
    height
  );
}
