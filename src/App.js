import { useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import './App.css';

function App() {
  const idCardRef = useRef();
  const selfieRef = useRef();
  const isFirstRender = useRef(true);

  const renderFace = async (image, x, y, width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    context?.drawImage(image, x, y, width, height, 0, 0, width, height);
    canvas.toBlob((blob) => {
      image.src = URL.createObjectURL(blob);
    }, "image/jpeg");
  };

  useEffect(() => {
    // Prevent the function from executing on the first render
    if (isFirstRender.current) {
      isFirstRender.current = false; // toggle flag after first render/mounting
      return;
    }

    (async () => {
      // loading the models
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');

      // detect a single face from the ID card image
      const idCardFacedetection = await faceapi.detectSingleFace(idCardRef.current,
        new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceDescriptor();

      // detect a single face from the selfie image
      const selfieFacedetection = await faceapi.detectSingleFace(selfieRef.current,
        new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceDescriptor();

      //(OPTIONAL)
      /**
       * If a face was detected from the ID card image,
       * call our renderFace() method to display the detected face.
       */
      if (idCardFacedetection) {
        const { x, y, width, height } = idCardFacedetection.detection.box;
        renderFace(idCardRef.current, x, y, width, height);
      }
      //(OPTIONAL)
      /**
       * If a face was detected from the selfie image,
       * call our renderFace() method to display the detected face.
       */
      if (selfieFacedetection) {
        const { x, y, width, height } = selfieFacedetection.detection.box;
        renderFace(selfieRef.current, x, y, width, height);
      }

      /**
       * Do face comparison only when faces were detected
       */
      if(idCardFacedetection && selfieFacedetection){
        // Using Euclidean distance to comapare face descriptions
        const distance = faceapi.euclideanDistance(idCardFacedetection.descriptor, selfieFacedetection.descriptor);
        console.log(distance);
      }

    })();
  }, []);

  return (
    <>
      <div className="gallery">
        <img ref={idCardRef} src={require('./images/id-card.png')} alt="ID card" height="auto" />
      </div>

      <div className="gallery">
        <img ref={selfieRef} src={require('./images/selfie.webp')} alt="Selfie" height="auto" />
      </div>
    </>
  );
}

export default App;
