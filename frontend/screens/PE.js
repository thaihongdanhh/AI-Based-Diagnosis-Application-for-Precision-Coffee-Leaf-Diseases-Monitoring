import React from 'react'
import { Camera } from 'expo-camera'
import { cameraWithTensors } from '@tensorflow/tfjs-react-native'
import {
  AppRegistry,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Block,
  Image,
  Platform,
  Modal,
  SafeAreaView,

} from 'react-native'

import * as tf from '@tensorflow/tfjs'
import * as jpeg from 'jpeg-js';

import { theme } from 'galio-framework';
import { Card } from 'react-native-elements'


// import * as faceDetection from '@tensorflow-models/face-detection'
import * as ScreenOrientation from 'expo-screen-orientation'
import Svg, { Circle, Rect } from 'react-native-svg'
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Images, nowTheme } from '../constants';
const { width, height } = Dimensions.get('screen');

const TensorCamera = cameraWithTensors(Camera)

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


export default class PE extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      modalProcess: false,
      Image: [],
      orientation: null,
      outputTensorWidth: null,
      outputTensorHeight: null,
      Loading: false
    }
  }

  handleCameraStream = async (images, updatePreview, gl) => {
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

      const rawImageData = { data, width, height };
      const jpegImageData = jpeg.encode(rawImageData);

      const imgBase64 = tf.util.decodeString(jpegImageData.data, "base64")
      this.setState({
        // Loading: true
      }, async () => {
        // console.log(imgBase64)
        const formdata = new FormData();

        formdata.append('files', {
          uri: 'data:image/png;base64,' + imgBase64, // base64
          name: 'coffee-mobile.png',
          type: 'image/png',
        });

        await axios.post('http://ai.ailab.vn:5003/upload2', formdata, { headers: { 'Content-Type': 'multipart/form-data' } })
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


  isPortrait = () => {
    const {
      orientation
    } = this.state
    return (
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP
      // || orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
    )
  }

  getOutputTensorWidth = () => {
    return OUTPUT_TENSOR_WIDTH
    // return this.isPortrait() || IS_ANDROID
    //   ? OUTPUT_TENSOR_WIDTH
    //   : OUTPUT_TENSOR_HEIGHT
  }

  getOutputTensorHeight = () => {
    return OUTPUT_TENSOR_HEIGHT
    // return this.isPortrait() || IS_ANDROID
    //   ? OUTPUT_TENSOR_HEIGHT
    //   : OUTPUT_TENSOR_WIDTH
  }

  getTextureRotationAngleInDegrees = async () => {
    // On Android, the camera texture will rotate behind the scene as the phone
    // changes orientation, so we don't need to rotate it in TensorCamera.
    console.log('Vô đây rồi ==============')
    if (IS_ANDROID) {
      return 0
    }

    // For iOS, the camera texture won't rotate automatically. Calculate the
    // rotation angles here which will be passed to TensorCamera to rotate it
    // internally.
    // console.log(this.state.orientation)
    switch (this.state.orientation) {
      // Not supported on iOS as of 11/2021, but add it here just in case.
      case ScreenOrientation.Orientation.PORTRAIT_DOWN:
        return 180
      case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
        return CameraType.front ? 270 : 90
      case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
        return CameraType.front ? 90 : 270
      default:
        return 0
    }
  }

  sleep = ms => new Promise(
    resolve => setTimeout(resolve, ms)
  );

  render() {
    const { 
      isLoading, 
      modalProcess,
      outputTensorHeight, 
      outputTensorWidth } = this.state
    // console.log(this.getOutputTensorWidth())
    // console.log(this.getOutputTensorHeight())
    if (isLoading) {
      return <View></View>
    } else {
      return (
        <>
          <View flex >
            {!this.state.Loading && (
              <Image source={{ uri: this.state.Image }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
            )}
          </View>
          <View>
            <Block flex style={styles.container}>
              <Modal
                animationType='slide'
                transparent={true}
                visible={modalProcess}
                // key={this.state.data2['index']}
                onRequestClose={() => { }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.modalText}>
                      On Developing ... Not Available Yet !{' '}
                    </Text>
                    <Block row center space='between'>                      
                    </Block>
                  </View>
                </View>
              </Modal>              
              {/* <Block flex center>
          <ImageBackground  
            source={Images.Pro}
            style={{ height, width, zIndex: 1 }} 
          />     
        </Block> */}
              <Block flex space="between" style={styles.padded}>

                <Block middle row style={{
                  marginTop: 150
                }}>
                  <Image
                    source={Images.Logo}
                    style={{
                      // height: 200,
                      // width: "600",
                      resizeMode: 'stretch',
                      width: width - theme.SIZES.BASE * 2
                    }}
                  />
                </Block>

                <Block middle row style={{}}>
                  <SafeAreaView style={styles.containerCard}>
                    <View style={styles.containerCard}>
                      <Card containerStyle={styles.containerCard} wrapperStyle={{
                        width: width - theme.SIZES.BASE * 2
                      }}>
                        <Card.Title style={[styles.titleCard, {
                          paddingTop: 15
                        }]}>
                          MODULES
                        </Card.Title>
                        <Card.Divider />
                        {/* <Text style={{ textAlign: 'center', fontSize: '20px' }}>
                    
                  </Text> */}
                        <Text style={styles.paragraph}>
                          {time} - {date_current}
                        </Text>
                        <Block row>
                          <Button
                            textStyle={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black' }}
                            style={styles.buttonA}
                            onPress={() => navigation.navigate("PE", { isReload: false })}
                          >
                            <Text style={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black', textAlign: 'center' }}>Pond{'\n'}Environment </Text>
                          </Button>
                          <Button
                            textStyle={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black' }}
                            style={styles.buttonB}
                            onPress={() => navigation.navigate("W", { isReload: false })}
                          >
                            Weather
                          </Button>
                        </Block>
                        <Block row>
                          <Button
                            textStyle={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black' }}
                            style={styles.buttonC}
                            onPress={() => navigation.navigate("AA", { isReload: false })}
                          >
                            Aqua Assistant
                          </Button>
                          <Button
                            textStyle={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black' }}
                            style={styles.buttonD}
                            onPress={() => navigation.navigate("CS", { isReload: false })}
                          >
                            Control System
                          </Button>
                        </Block>
                      </Card>
                    </View>
                  </SafeAreaView>
                </Block>

                <Block middle flex space="around" style={{ zIndex: 2 }}>
                  <Block middle row>

                  </Block>
                  <Block middle row style={{ marginTop: 200, marginBottom: 500 }}>
                    <Text
                      color="white"
                      size={16}
                      style={{ fontFamily: 'montserrat-regular' }}
                    >
                      {/* Developed by DanhTH */}
                    </Text>
                  </Block>
                </Block>
              </Block>
            </Block>

          </View>

        </>
      )
    }
  }

  async componentDidMount() {
    await tf.ready()

    // let canvas = document.getElementById("video-canvas");
    // let url = "ws://ai.ailab.vn:5005/media/zurich"

    // new JSMpeg.Player(url, { canvas: canvas });

    const cameras = ['cam5']
    // const cameras = ['cam1', 'cam2']
    cameras.map((data, index) => {
      const client = new W3CWebSocket('ws://ai.ailab.vn:5005/media/' + data);
      client.onopen = () => {
        console.log('WebSocket Client Connected ' + data);
        this.setState({
          isQuetLai: true,
          message_log: ''
        }, () => {
          client.onmessage = async (message) => {
            // console.log(JSON.parse(message.data))
            var img = Buffer.from(JSON.parse(message.data).src, 'base64');
            // console.log(JSON.parse(message.data).count)       
            // console.log(img)     
            this.setState({
              Image: 'data:image/png;base64,' + JSON.parse(message.data).src,
              [data]: {
                src: 'data:image/png;base64,' + JSON.parse(message.data).src,
                raw: 'data:image/png;base64,' + JSON.parse(message.data).raw,
                rotate: '0deg',
                count: JSON.parse(message.data).count,
                color: JSON.parse(message.data).color
              },
              isLoading: false
            })

          }
        })
      }
    })

    // this.setState({
    //   isLoading: false
    // })
  }

  componentWillUnmount () {
    clearInterval(this.time, this.date_current)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  camera: {
    // flex: 1,
    // height: '85%',
    // width: '100%',
    // flex: 0,
    // height: '100%',
    // borderColor: 'green',
    // borderWidth: 10,
    // width: 400,
    // borderRadius: 360,
    // backgroundColor: 'transparent',
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    // alignSelf: 'center',
    // height: 400,
    // overflow: 'hidden'
  },
  svg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 30
  },
})
