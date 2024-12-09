import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from 'react-native';
import {
  cameraWithTensors
} from '@tensorflow/tfjs-react-native'

import * as tf from '@tensorflow/tfjs'
import * as jpeg from 'jpeg-js';

// import * as faceDetection from '@tensorflow-models/face-detection'
import * as ScreenOrientation from 'expo-screen-orientation'
import axios from 'axios';

const TensorCamera = cameraWithTensors(CameraView)


const IS_ANDROID = Platform.OS === 'android'
const IS_IOS = Platform.OS === 'ios'

// const model = faceDetection.SupportedModels.MediaPipeFaceMesh;
// const detectorConfig = {
//   runtime: 'mediapipe', // or 'tfjs'
// }
// const detector = await faceDetection.createDetector(model, detectorConfig);

// Camera preview size.
//
// From experiments, to render camera feed without distortion, 16:9 ratio
// should be used fo iOS devices and 4:3 ratio should be used for android
// devices.
//
// This might not cover all cases.
const CAM_PREVIEW_WIDTH = Dimensions.get('window').width
const CAM_PREVIEW_HEIGHT = CAM_PREVIEW_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4)

// The score threshold for pose detection results.
const MIN_KEYPOINT_SCORE = 0.3

// The size of the resized output from TensorCamera.
//
// For movenet, the size here doesn't matter too much because the model will
// preprocess the input (crop, resize, etc). For best result, use the size that
// doesn't distort the image.
const OUTPUT_TENSOR_WIDTH = 480
const OUTPUT_TENSOR_HEIGHT = OUTPUT_TENSOR_WIDTH / (IS_IOS ? 9 / 16 : 3 / 4)
// OUTPUT_TENSOR_WIDTH = 360
// OUTPUT_TENSOR_HEIGHT = 360

// Whether to auto-render TensorCamera preview.
const AUTO_RENDER = true

// Whether to load model from app bundle (true) or through network (false).
const LOAD_MODEL_FROM_BUNDLE = false

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function handleCameraStream (images, updatePreview, gl) {
    const loop = async () => {
      const nextImageTensor = images.next().value
      const height = nextImageTensor.shape[0]
      const width = nextImageTensor.shape[1]
      const data = new Buffer(
          // concat with an extra alpha channel and slice up to 4 channels to handle 3 and 4 channels tensors
          tf.concat([nextImageTensor, tf.ones([height, width, 1]).mul(255)], [-1])
          .slice([0], [height, width, 4])
          .dataSync(),
      )

      const rawImageData = {data, width, height};
      const jpegImageData = jpeg.encode(rawImageData);

      const imgBase64 = tf.util.decodeString(jpegImageData.data, "base64")
      console.log(imgBase64)
      this.setState({
        // Loading: true
      },async () => {
          // console.log(imgBase64)
          const formdata = new FormData();

          formdata.append('files', {
            uri: 'data:image/png;base64,' + imgBase64, // base64
            name: 'coffee-mobile.png',
            type: 'image/png',
          });

          await axios.post('http://ai.ailab.vn:5004/upload2', formdata, {headers: {'Content-Type': 'multipart/form-data'}})
          .then(res => {
            // console.log(res.data[0].file_process)
            this.setState({
              Image: res.data,
              // Loading: false
            })
          })
          nextImageTensor.dispose();          
      })
      
      

      //
      // do something with tensor here
      //

      // if autorender is false you need the following two lines.
      // updatePreview();
      // gl.endFrameEXP();
      await this.sleep(200)
      requestAnimationFrame(loop)
    }
    loop()
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      {/* <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView> */}
      <TensorCamera        
        style={styles.camera}
        facing={facing}
        // resizeWidth={this.getOutputTensorWidth()}
        // resizeHeight={this.getOutputTensorHeight()}
        // resizeDepth={3}
        onReady={(imageAsTensors) => handleCameraStream(imageAsTensors)}
        autorender={false}
      >
      </TensorCamera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
