const splash = document.getElementById("splash-screen");
const logoImg = document.getElementById("logo-img");
const fittingRoom = document.getElementById("fitting-room");

logoImg.onclick = () => {
  splash.style.display = "none";
  fittingRoom.style.display = "block";
  startPose();
};

function onResults(results) {
  videoCtx.clearRect(0, 0, videoCanvas.width, videoCanvas.height);
  videoCtx.drawImage(results.image, 0, 0, videoCanvas.width, videoCanvas.height);

  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if (!results.poseLandmarks) return;

  const ls = results.poseLandmarks[11];
  const rs = results.poseLandmarks[12];
  const lh = results.poseLandmarks[23];
  const rh = results.poseLandmarks[24];

  const centerX = (ls.x + rs.x) / 2 * overlayCanvas.width;
  const shoulderY = (ls.y + rs.y) / 2 * overlayCanvas.height;
  const hipY = (lh.y + rh.y) / 2 * overlayCanvas.height;

  const shoulderWidth = Math.abs(ls.x - rs.x) * overlayCanvas.width;
  const torsoHeight = hipY - shoulderY;

  const imgWidth = shoulderWidth * 1.8;
  const imgHeight = torsoHeight * 1.8;

  if (usingFrontCamera) {
    // Imagen justo debajo del cuello, cubriendo torso sin tapar la cara
    overlayCtx.drawImage(
      clothingImg,
      centerX - imgWidth / 2,
      shoulderY + 10,
      imgWidth,
      imgHeight
    );
  } else {
    // Mantener dibujo original (por si usas cámara trasera)
    overlayCtx.drawImage(
      clothingImg,
      centerX - imgWidth / 2,
      shoulderY - imgHeight / 3,
      imgWidth,
      imgHeight
    );
  }
}
