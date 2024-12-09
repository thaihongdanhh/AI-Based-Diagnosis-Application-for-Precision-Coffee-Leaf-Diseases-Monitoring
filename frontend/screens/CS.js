import axios from 'axios'
import { Camera, CameraType, FlashMode } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import Constants from 'expo-constants'
import { DeviceMotion } from 'expo-sensors'
import React, { Fragment, useState } from 'react'
import ReactNative, {
  BackHandler,
  Image,
  SafeAreaView,
  ScrollView,
  LogBox,
  Pressable,
  Modal,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
  Platform,
  TextInput
} from 'react-native'

import { Button } from '../components'
import { Card } from 'react-native-elements'
import Images from '../constants/Images'
import SelectDropdown from 'react-native-select-dropdown'
import RadioGroup from 'react-native-radio-buttons-group'

import { Block, theme, Text as GText } from 'galio-framework'
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator'
import moment from 'moment'
import * as FileSystem from 'expo-file-system'
import { connect } from 'react-redux'

import { fetchPE } from '../store/actions/aiaqua'
import * as Device from 'expo-device'
import * as Progress from 'react-native-progress'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { w3cwebsocket as W3CWebSocket } from 'websocket'

import * as tf from '@tensorflow/tfjs'
// import * as posedetection from '@tensorflow-models/pose-detection'
// import * as faceDetection from '@tensorflow-models/face-landmarks-detection'
import * as faceDetection from '@tensorflow-models/face-detection'
import * as ScreenOrientation from 'expo-screen-orientation'
import {
  bundleResourceIO,
  cameraWithTensors
} from '@tensorflow/tfjs-react-native'
import Svg, { Circle, Rect } from 'react-native-svg'
import { ExpoWebGLRenderingContext } from 'expo-gl'
import base64 from 'react-native-base64'
import { Buffer } from 'buffer'
import * as MediaLibrary from 'expo-media-library'
import * as jpeg from 'jpeg-js'

import { Amplify, Auth, Storage } from 'aws-amplify'
import awsconfig from './aws-exports'
import { useNavigation } from '@react-navigation/native'

Amplify.configure(awsconfig)

const { width } = Dimensions.get('screen')
import { RadioButton } from 'react-native-paper'

class CS extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isLoading: true,
      dataPE: [],
      isSuccess: false
    }
  }

  render () {
    const { isLoading, dataPE } = this.state

    const { navigation, route } = this.props

    if (isLoading) {
      // return <View />
      return (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator
            style={{ width: 300, height: 300 }}
            color={'black'}
          />
        </View>
      )
    } else if (!isLoading) {
      return (
        <View flex style={styles.container}>
          <Block flex space='between' style={styles.padded}>
            <ScrollView
              style={{
                flex: 1
              }}
              contentContainerStyle={
                {
                  // width: width * 1.5,
                  // height: 500,
                  // paddingHorizontal: 10
                }
              }
            >
              <Button
                textStyle={{
                  fontFamily: 'montserrat-regular',
                  fontSize: 18,
                  color: 'black'
                }}
                style={styles.buttonA}
                onPress={() =>
                  navigation.navigate('Onboarding', { isReload: false })
                }
              >
                Control System
              </Button>
              <Card
                containerStyle={{
                  width: width - theme.SIZES.BASE * 2,
                  alignItems: 'center',
                  justifyContent: 'center'
                  // height: 250
                }}
                wrapperStyle={{
                  width: width - theme.SIZES.BASE * 2
                }}
              >
                <Card.Title
                  style={[
                    styles.titleCard,
                    {
                      padding: 15,
                      backgroundColor: '#00906D',
                      color: 'white'
                    }
                  ]}
                >
                  Control Device
                </Card.Title>
                <Card.Divider />
                <Block
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SelectDropdown
                    data={['Motor 1', 'DO', 'Feeding', 'Water Fan']}
                    onSelect={(selectedItem, index) => {
                      // console.log(selectedItem, index)
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                      // text represented after item is selected
                      // if data array is an array of objects then return selectedItem.property to render after item is selected
                      return selectedItem
                    }}
                    rowTextForSelection={(item, index) => {
                      // text represented for each item in dropdown
                      // if data array is an array of objects then return item.property to represent item in dropdown
                      return item
                    }}
                  />
                </Block>
              </Card>

              <Card
                containerStyle={{
                  width: width - theme.SIZES.BASE * 2,
                  alignItems: 'center',
                  justifyContent: 'center'
                  // height: 250
                }}
                wrapperStyle={{
                  width: width - theme.SIZES.BASE * 2
                }}
              >
                <Card.Title
                  style={[
                    styles.titleCard,
                    {
                      padding: 15,
                      backgroundColor: '#00906D',
                      color: 'white'
                    }
                  ]}
                >
                  Control Status
                </Card.Title>
                <Card.Divider />
                <Block
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <RadioGroup
                    layout={'row'}
                    radioButtons={[
                      {
                        id: '1', // acts as primary key, should be unique and non-empty string
                        label: 'On',
                        value: 'on'
                      },
                      {
                        id: '2',
                        label: 'Off',
                        value: 'off'
                      },
                      {
                        id: '3',
                        label: 'Pause',
                        value: 'pause'
                      },
                      {
                        id: '4',
                        label: 'Corrupt',
                        value: 'corrupt'
                      }
                    ]}
                    onPress={selectedId => {
                      // console.log(selectedId)
                      this.setState({ status: selectedId })
                    }}
                    selectedId={this.state.status? this.state.status : "1" }
                  />
                </Block>
              </Card>
              <Card
                containerStyle={{
                  width: width - theme.SIZES.BASE * 2,
                  alignItems: 'center',
                  justifyContent: 'center'
                  // height: 250
                }}
                wrapperStyle={{
                  width: width - theme.SIZES.BASE * 2
                }}
              >
                <Card.Title
                  style={[
                    styles.titleCard,
                    {
                      padding: 15,
                      backgroundColor: '#00906D',
                      color: 'white'
                    }
                  ]}
                >
                  Control Type
                </Card.Title>
                <Card.Divider />
                <Block
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <RadioGroup
                    layout={'row'}
                    radioButtons={[
                      {
                        id: '1', // acts as primary key, should be unique and non-empty string
                        label: 'Automatic',
                        value: 'automatic'
                      },
                      {
                        id: '2',
                        label: 'Manual',
                        value: 'manual'
                      },
                      {
                        id: '3',
                        label: 'Semi-automatic',
                        value: 'semi-automatic'
                      }
                    ]}
                    onPress={selectedId => {
                      this.setState({type: selectedId })
                    }}
                    selectedId={this.state.type ? this.state.type : "1"}
                  />
                </Block>
              </Card>
              <View
                                      style={{ flex: 1, flexDirection: 'row' }}
                                    >
              <Card
                containerStyle={{
                  width: (width - theme.SIZES.BASE * 2) / 2.2,
                  alignItems: 'center',
                  justifyContent: 'center'
                  // height: 250
                }}
                wrapperStyle={{
                  width: (width - theme.SIZES.BASE * 2) / 2.2
                }}
                style={{flex: 0.5}}
              >
                <Card.Title
                  style={[
                    styles.titleCard,
                    {
                      padding: 15,
                      backgroundColor: '#00906D',
                      color: 'white'
                    }
                  ]}
                >
                  Control Mode 1
                </Card.Title>
                <Card.Divider />
                <Block
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <RadioGroup
                    layout={'column'}
                    radioButtons={[
                      {
                        id: '1', // acts as primary key, should be unique and non-empty string
                        label: 'Mode 1',
                        value: 'mode1'
                      },
                      {
                        id: '2',
                        label: 'Mode 2',
                        value: 'mode2'
                      },
                      {
                        id: '3',
                        label: 'Mode 3',
                        value: 'mode3'
                      },
                    ]}
                    onPress={selectedId => {
                      this.setState({ mode1: selectedId })
                    }}
                    selectedId={this.state.mode1 ? this.state.mode1 : "1"}
                  />
                </Block>
              </Card>
              <Card
                containerStyle={{
                  width: (width - theme.SIZES.BASE * 2) / 2.1,
                  alignItems: 'center',
                  justifyContent: 'center'
                  // height: 250
                }}
                wrapperStyle={{
                  width: (width - theme.SIZES.BASE * 2) / 2.1
                }}
                style={{flex: 0.5}}
              >
                <Card.Title
                  style={[
                    styles.titleCard,
                    {
                      padding: 15,
                      backgroundColor: '#00906D',
                      color: 'white'
                    }
                  ]}
                >
                  Control Mode 2
                </Card.Title>
                <Card.Divider />
                <Block
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <RadioGroup
                    layout={'column'}
                    radioButtons={[
                      {
                        id: '1', // acts as primary key, should be unique and non-empty string
                        label: 'Mode 1',
                        value: 'mode1'
                      },
                      {
                        id: '2',
                        label: 'Mode 2',
                        value: 'mode2'
                      },
                      {
                        id: '3',
                        label: 'Mode 3',
                        value: 'mode3'
                      },
                    ]}
                    onPress={selectedId => {
                      this.setState({ mode2: selectedId })
                    }}
                    selectedId={this.state.mode2 ? this.state.mode2 : "1"}
                  />
                </Block>
              </Card>
              </View>
              <Card
                containerStyle={styles.containerCard}
                wrapperStyle={{
                  width: width - theme.SIZES.BASE * 2
                }}
              >
                <Card.Title
                  style={[
                    styles.titleCard,
                    {
                      padding: 15,
                      backgroundColor: '#00906D',
                      color: 'white'
                    }
                  ]}
                >
                  Others/Notes
                </Card.Title>
                <Card.Divider />
                <Block
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                <TextInput
                    style={{
                      height: 100,
                      width: 300,
                      // margin: 12,
                      borderWidth: 1,
                      padding: 10,
                    }}
                    multiline={true}
                    numberOfLines={4}
                    onChangeText={(text) => this.setState({text})}
                    value={this.state.text}/>
                </Block>
              </Card>                    
              <Button
                textStyle={{
                  fontFamily: 'montserrat-regular',
                  fontSize: 18,
                  color: 'white'
                }}
                style={styles.buttonB}
                onPress={() =>
                  this.setState({
                    isSuccess: true
                  },() =>{
                    setTimeout(() => {
                      this.setState({
                        isSuccess: false
                      })                      
                    }, 3000)
                  })
                }
              >
                Submit
              </Button>        
            </ScrollView>
          </Block>
          <Modal
                animationType='slide'
                transparent={true}
                visible={this.state.isSuccess}
                // key={this.state.data2['index']}
                onRequestClose={() => {
                  // Alert.alert('Modal has been closed.');
                  // this.setModalVisible(!modalSuccess);
                  this.setState({
                    modalSuccess: !this.state.modalSuccess
                  })
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text
                      style={styles.modalText}
                    >{`Submit Successfully !`}</Text>
                    <Block row center space='between'>
                      <View>
                        <Image
                          source={require('../assets/iconsuccess.png')}
                          style={{ height: 50, width: 50 }}
                        />
                      </View>
                    </Block>
                  </View>
                </View>
              </Modal>
        </View>
      )
    }
  }

  componentDidMount () {
    this.props.onfetchPE(dataPE => {
      this.setState({
        dataPE,
        isLoading: false
      })
    })
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
  paragraph: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    textAlignVertical: 'center',
    justifyContent: 'flex-start'
  },

  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center'
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    // padding: 35,

    width: width - theme.SIZES.BASE * 1.2,
    paddingVertical: theme.SIZES.BASE * 0.5,
    paddingHorizontal: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'red'
  },
  button: {
    borderRadius: 20,
    padding: 5,
    elevation: 2,
    width: 100
  },
  buttonSubmit: {
    backgroundColor: 'rgba(24,206,15, 0.8)'
  },
  buttonClose: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  buttonDelete: {
    backgroundColor: '#FF3636'
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Constants.statusBarHeight + 1
  },
  bottomBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 1,
    position: 'absolute',
    borderColor: '#3b5998',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  faceText: {
    color: '#32CD32',
    fontWeight: 'bold',
    textAlign: 'left',
    margin: 2,
    backgroundColor: 'transparent'
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0
  },
  textcolor: {
    color: '#008080'
  },
  textStandard: {
    fontSize: 18,
    marginBottom: 20,
    color: 'white'
  },
  countdown: {
    fontSize: 40,
    color: 'white'
  },
  options: {
    // marginBottom: 24,
    // marginTop: 10,
    elevation: 4
  },
  defaultStyle: {
    // paddingVertical: 15,
    paddingHorizontal: 8,
    color: 'white'
  },
  buttonA: {
    width: width - theme.SIZES.BASE * 2,
    height: theme.SIZES.BASE * 3,
    backgroundColor: '#D0F0C0',
    color: theme.COLORS.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15
  },
  buttonB: {
    width: width - theme.SIZES.BASE * 2,
    height: theme.SIZES.BASE * 3,
    backgroundColor: 'blue',
    color: theme.COLORS.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15
  },
  
  buttonC: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 6,
    backgroundColor: '#74C365',
    borderWidth: 0
  },
  buttonD: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 6,
    backgroundColor: '#D0F0C0',
    borderWidth: 0
  },
  containerCard: {
    // flex: 1,
    width: width - theme.SIZES.BASE * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  padded: {
    top: 20,
    // paddingHorizontal: theme.SIZES.BASE * 1.5,
    // position: 'absolute',
    bottom: theme.SIZES.BASE,
    zIndex: 2,
    marginBottom: 150
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    minHeight: 48,
    paddingStart: 8,
    paddingEnd: 8,
    borderRadius: 4,
    marginBottom: 4
  }
})

const mapStateToProps = state => {
  return {
    // user: state.user,
    // errors: state.errors,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onfetchPE: callback => {
      dispatch(fetchPE(callback))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CS)
