import React from 'react'
import { CameraView, CameraType } from 'expo-camera'
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
    StatusBar,
    SafeAreaView,
    Modal,
    ScrollView

} from 'react-native'

import { Root, Toast, Popup } from 'react-native-popup-confirm-toast'

import { theme } from 'galio-framework';


import * as tf from '@tensorflow/tfjs'
import * as jpeg from 'jpeg-js';

import { GestureHandlerRootView } from 'react-native-gesture-handler'

// import * as faceDetection from '@tensorflow-models/face-detection'
import { Button as EButton, Input, Card } from 'react-native-elements'
import * as ScreenOrientation from 'expo-screen-orientation'
import Svg, { Circle, Rect } from 'react-native-svg'
import axios from 'axios';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import ImageView from "react-native-image-viewing";
import * as ImagePicker from 'expo-image-picker';

import Images from "../constants/Images";
import { Dropdown } from 'react-native-element-dropdown';

const { width } = Dimensions.get('screen');


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
let camera

export default class Camera2 extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: true,
            isCapture: false,
            modalImage: false,
            modalUploadSuccess: false,
            modalTakePicSuccess: false,
            previewCapture: false,
            image: null,
            Image: "",
            orientation: null,
            item: { label: "Please select Farm - Block", value: "-1" },
            outputTensorWidth: null,
            outputTensorHeight: null,
            Loading: false,
            dataFarm: [
                { label: 'FARM DT01 - Block A', value: '1' },
                { label: 'FARM DT01 - Block B', value: '2' },
                { label: 'FARM DT01 - Block C', value: '3' },
                { label: 'FARM DT02 - Block A', value: '4' },
                { label: 'FARM DT02 - Block B', value: '5' },
            ]
        }
    }

    __takePicture = async () => {
        if (!camera) return
        const photo = await camera.takePictureAsync({ base64: true, imageType: "jpeg", })

        const formdata = new FormData();
        formdata.append('files', {
            uri: 'data:image/jpeg;base64,' + photo.base64, // base64
            name: 'coffee-mobile.jpg',
            type: 'image/jpeg',
        });
        formdata.append('farm_name', this.state.item?.label.split(' - ')[0]);
        formdata.append('block_name', this.state.item?.label.split(' - ')[1]);

        await axios.post('http://ai.ailab.vn:5004/upload2', formdata, { headers: { 'Content-Type': 'multipart/form-data' } })
            .then(res => {
                // console.log(res.data[0].file_process)
                this.setState({
                    Image: res.data[0].file_process,
                    modalTakePicSuccess: !this.state.modalTakePicSuccess,
                    previewCapture: true,
                    // Loading: false
                },() => {
                    setTimeout(() => {
                        this.setState({
                            modalTakePicSuccess: false
                        })
                    }, 2000)
                })
            })
        // console.log(photo.base64)        
        // setPreviewVisible(true)
        // setCapturedImage(photo)
    }

    __pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            //   allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            allowsMultipleSelection: true,
            base64: true
        });        

        if (!result.canceled) {
            result?.assets?.map(async (data, index) => {                
                const formdata = new FormData();
                formdata.append('files', {
                    uri: 'data:image/jpeg;base64,' + data.base64, // base64
                    name: data.fileName,
                    type: 'image/jpeg',
                });
                formdata.append('farm_name', this.state.item?.label.split(' - ')[0]);
                formdata.append('block_name', this.state.item?.label.split(' - ')[1]);

                // console.log(data)
                // const formdata = {
                //     // files: {
                //     //         uri: 'data:image/jpeg;base64,' + data.base64,
                //     //         name: data.fileName,
                //     //         type: 'image/jpeg'
                //     //     },
                //     // farm_name:  this.state.item?.label.split(' - ')[0],
                //     // block_name:  this.state.item?.label.split(' - ')[1]
                // }

                // console.log(this.state.item)
                await axios.post('http://ai.ailab.vn:5004/upload2', formdata, { headers: { 'Content-Type': 'multipart/form-data' } })
                    .then(res => {
                        // console.log(res.data[0].file_process)
                        this.setState({
                            Image: res.data[0].file_process,
                            modalUploadSuccess: !this.state.modalUploadSuccess
                            // previewCapture: true,
                            // Loading: false
                        },() => {
                            setTimeout(() => {
                                this.setState({
                                    modalUploadSuccess: false
                                })
                              }, 2000)
                        })
                    })
            }) 
        }
    };

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
            console.log(imgBase64)
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

                await axios.post('http://ai.ailab.vn:5004/upload2', formdata, { headers: { 'Content-Type': 'multipart/form-data' } })
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
        const { navigation, route } = this.props
        const {
            isLoading,
            isCapture,
            previewCapture,
            dataFarm,
            item,
            modalImage,
            modalUploadSuccess,
            modalTakePicSuccess,
            outputTensorHeight,
            outputTensorWidth
        } = this.state
        // console.log(this.getOutputTensorWidth())
        // console.log(this.getOutputTensorHeight())
        if (isLoading) {
            return <View></View>
        } else {
            return <View style={{ flex: 1 }}>
                {/* <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalImage}
                    onRequestClose={() => {
                        this.setState({ modalImage: !this.state.modalImage })
                    }}>
                    <Root>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <>
                                    <Text style={styles.modalText}>Picture</Text>
                                    <View>
                                        <ScrollView style={{
                                            width: width - theme.SIZES.BASE * 2,
                                            paddingVertical: theme.SIZES.BASE,
                                            paddingHorizontal: 10,
                                            // padding: "100%"
                                        }}>
                                            <ImageView
                                                images={[{uri: this.state.Image}]}
                                                imageIndex={0}
                                                visible={this.state.modalImage}
                                                onRequestClose={() => this.setState({
                                                    modalImage: !this.state.modalImage
                                                })}
                                            />
                                        </ScrollView>
                                    </View>
                                </>
                            </View>
                        </View>
                    </Root>
                </Modal> */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalUploadSuccess}
                    // key={this.state.data2['index']}
                    onRequestClose={() => {
                        // Alert.alert('Modal has been closed.');
                        // this.setModalVisible(!modalSuccess);
                        this.setState({
                            modalUploadSuccess: !this.state.modalUploadSuccess
                        })
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Successfully Upload !</Text>
                                <View>
                                    <Image
                                        source={require('../assets/iconsuccess.png')}
                                        style={{ height: 50, width: 50 }}
                                    />
                                </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalTakePicSuccess}
                    // key={this.state.data2['index']}
                    onRequestClose={() => {
                        // Alert.alert('Modal has been closed.');
                        // this.setModalVisible(!modalSuccess);
                        this.setState({
                            modalTakePicSuccess: !this.state.modalTakePicSuccess
                        })
                    }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Successfully Take a Picture !</Text>
                                <View>
                                    <Image
                                        source={require('../assets/iconsuccess.png')}
                                        style={{ height: 50, width: 50 }}
                                    />
                                </View>
                        </View>
                    </View>
                </Modal>


                {(isCapture && !previewCapture) && (
                    <CameraView
                        // Standard Camera props
                        // ratio='1:1'            
                        // cameraTextureWidth={this.getTextureRotationAngleInDegrees()}            
                        ref={(r) => {
                            camera = r
                        }}
                        // mirror={false}
                        style={styles.camera}
                        facing='back'
                        // type={Camera.Constants.Type.back}
                        resizeWidth={this.getOutputTensorWidth()}
                        resizeHeight={this.getOutputTensorHeight()}
                        resizeDepth={3}
                        // onReady={this.handleCameraStream}
                        autorender={false}
                    >
                        <View
                            style={{
                                flex: 1,
                                width: '100%',
                                height: "100%",
                                backgroundColor: 'transparent',
                                flexDirection: 'row'
                            }}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    flexDirection: 'row',
                                    flex: 1,
                                    width: '100%',
                                    padding: 20,
                                    justifyContent: 'space-between'
                                }}>
                                <EButton
                                    title='Back'
                                    onPress={
                                        () => {
                                            this.setState({
                                                isCapture: false,
                                            })
                                            // navigation.navigate('HomeDrawer', {})
                                            // console.log('Press OK !')
                                        }

                                    }
                                    buttonStyle={{
                                        // flex: 1,
                                        borderColor: '#20a8d8',
                                        backgroundColor: '#20a8d8'
                                    }}
                                    type='outline'
                                    // raised
                                    titleStyle={{
                                        color: 'white',
                                        fontSize: 24
                                    }}
                                    containerStyle={{
                                        width: '20%',
                                        height: "70%",
                                        // flex: 1,
                                        // height: 50,
                                        marginTop: 12,
                                        backgroundColor: '#20a8d8'
                                        //   marginBottom: theme.SIZES.BASE,
                                        //   width: width - theme.SIZES.BASE * 2,
                                    }}
                                />
                                <View
                                    style={{
                                        alignSelf: 'center',
                                        flex: 1,
                                        alignItems: 'center'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={this.__takePicture}
                                        style={{
                                            width: 70,
                                            height: 70,
                                            bottom: 0,
                                            marginRight: 70,
                                            borderRadius: 50,
                                            backgroundColor: '#fff'
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </CameraView >
                )}
                {(isCapture && previewCapture) && (
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <SafeAreaView style={{ flex: 1 }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                }}
                                onPress={() => {
                                    this.setState({
                                        modalImage: !this.state.modalImage
                                    })
                                }}
                            >
                                <Image style={{
                                    flex: 1,
                                    height: 700,
                                    paddingTop: 15,
                                    width: "100%"
                                }}
                                    resizeMode='contain'
                                    source={{ uri: this.state.Image }}
                                />
                            </TouchableOpacity>
                            <ImageView
                                images={[{ uri: this.state.Image }]}
                                imageIndex={0}
                                visible={this.state.modalImage}
                                onRequestClose={() => this.setState({
                                    modalImage: !this.state.modalImage
                                })}
                            />
                            <View
                                style={{ padding: 20 }}>
                                <EButton
                                    title='Back'
                                    onPress={
                                        () => {
                                            this.setState({
                                                previewCapture: false,
                                            })
                                            // navigation.navigate('HomeDrawer', {})
                                            // console.log('Press OK !')
                                        }

                                    }
                                    buttonStyle={{
                                        borderColor: '#20a8d8',
                                        backgroundColor: '#20a8d8'
                                    }}
                                    type='outline'
                                    raised
                                    titleStyle={{
                                        color: 'white',
                                        fontSize: 24
                                    }}
                                    containerStyle={{
                                        width: '20%',
                                        // height: "70%",
                                        // flex: 1,
                                        // height: 50,                                
                                        marginTop: 12,
                                        backgroundColor: '#20a8d8'
                                        //   marginBottom: theme.SIZES.BASE,
                                        //   width: width - theme.SIZES.BASE * 2,
                                    }}
                                />
                            </View>
                        </SafeAreaView>
                    </GestureHandlerRootView>

                )}
                {!isCapture && (
                    <View>
                        <Image style={{
                            height: 300,
                            width: "100%",
                            resizeMode: 'contain',
                        }}
                            source={Images.Upload} />
                        <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'black', textAlign: 'center' }}>
                            <Text style={{ color: '#18B5A3' }}>Upload</Text> your crop photo to identify diseases and receive tailored solutions instantly.
                        </Text>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            iconStyle={styles.iconStyle}
                            data={dataFarm}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Farm - Block"
                            searchPlaceholder="Search..."
                            value={item}
                            onChange={item => {
                                this.setState({ item: item });
                            }}></Dropdown>
                        <View style={{ backgroundColor: "rgba(0,133,117,0.25)", margin: 15 }}>
                            <Image style={{
                                height: 150,
                                margin: "auto",
                                // paddingTop: 15,
                                width: "70%",
                                justifyContent: "center",
                                alignItems: "center",
                                alignContent: "center",
                                resizeMode: 'contain',
                            }}
                                source={Images.D1} />
                            <TouchableOpacity
                                onPress={() => {
                                    if (String(this.state.item.value) === '-1') {
                                        alert('Please select Farm - Block')
                                    } else {
                                        this.setState({
                                            isCapture: true
                                        })
                                    }
                                }}
                            >
                                <Image style={{
                                    height: 75,
                                    margin: "auto",
                                    paddingBottom: 5,
                                    width: "70%",
                                    resizeMode: 'contain',
                                }}
                                    source={Images.D2} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    if (String(this.state.item.value) === '-1') {
                                        alert('Please select Farm - Block')
                                    } else {
                                        this.setState({
                                            isUpload: true,
                                        }, () => {
                                            this.__pickImage()
                                        })
                                    }
                                }}
                            >
                                <Image style={{
                                    height: 75,
                                    margin: "auto",
                                    paddingBottom: 5,
                                    width: "70%",
                                    resizeMode: 'contain',
                                }}
                                    source={Images.D3} />
                                {this.state.image && <Image source={{ uri: this.state.image }} style={{
                                    height: 300,
                                    width: "100%",
                                    resizeMode: 'contain',
                                }} />}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        }
    }

    async componentDidMount() {

        this.setState({
            isLoading: false
        })
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    camera: {

        width: '100%',
        flex: 0,
        height: '100%',

        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',

    },
    svg: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 30
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        // padding: 35,

        width: width - theme.SIZES.BASE * 2,
        paddingVertical: theme.SIZES.BASE,
        paddingHorizontal: 2,

        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    dropdown: {
        margin: 16,
        height: 50,
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5,
    },
    icon: {
        marginRight: 5,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
})
