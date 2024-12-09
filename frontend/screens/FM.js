import React from "react";
import { connect } from 'react-redux';
import {
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  SafeAreaView,
  View,
  Text,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { Block, theme } from "galio-framework";
import { Button } from '../components';
const { height, width } = Dimensions.get("screen");

import nowTheme from "../constants/Theme";
import Images from "../constants/Images";
import * as Progress from 'react-native-progress'
//import Card
import { Card, Input, Button as EButton } from 'react-native-elements';
// import * as Location from 'expo-location';
import { fetchFM, addFM, fetchIMG } from '../store/actions/aicoffee';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import ImageView from "react-native-image-viewing";


const GOOGLE_API_KEY = ""
const screenWidth = Dimensions.get('window').width
const uri_test = "http://ai.ailab.vn:5004/image?file_path=./uploads/IMG_4411.jpg"
class FM extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      time: new Date(Date.now()).toLocaleTimeString(),
      date_current: new Date(Date.now()).toLocaleDateString(),
      modalImage: false,
      modalViewImage: false,
      modalProcess: false,
      modalAdd: false,
      modalMap: false,
      modalSuccess: false,
      loadingMap: false,
      isDetail: false,
      isViewDetail: false,
      isLoading: true,
      block_name: "",
      description: "",
      location: "",
      block_wealth: "",
      block_area: "",
      dataFarm: [],
      dataIMG: [],
      blockSelected: 'BLOCK A',
      imageSelected: '',
      statusSelected: '',
      countSelected: '',
      marker: { lat: 10.8094091, lng: 106.6890227 },
      region: { lat: 10.8094091, lng: 106.6890227 }
    }
  }

  handleSetMarker = (data, details) => {
    console.log('data', data)
    console.log('details', details)
    this.setState({
      region: details.geometry.location,
      marker: details.geometry.location
    })
  }

  render() {
    const { navigation } = this.props;
    const {
      time,
      date_current,
      isLoading,
      isDetail,
      isViewDetail,
      region,
      marker,
      modalAdd,
      modalMap,
      modalViewImage,
      modalSuccess,
      dataFarm,
      dataIMG,
      statusSelected,
      imageSelected,
      countSelected,
      loadingMap } = this.state

    return (
      <Block flex style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalSuccess}
          // key={this.state.data2['index']}
          onRequestClose={() => {
            // Alert.alert('Modal has been closed.');
            // this.setModalVisible(!modalSuccess);
            this.setState({
              modalSuccess: !this.state.modalSuccess
            })
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Successfully Add !</Text>
              <Block row center space="between">
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
        <Modal
          animationType='slide'
          transparent={true}
          visible={modalMap}
        // key={this.state.data2['index']}          

        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {/* <MapView style={styles.map} />  */}
              <MapView
                style={styles.map}
                mapType='satellite'
                // provider={PROVIDER_GOOGLE}
                region={{
                  latitude: region.lat,
                  longitude: region.lng,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={(e) => {
                  this.setState({
                    marker: { lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude }
                  })
                }}
              >
                {marker && (
                  <Marker
                    coordinate={{
                      latitude: marker.lat,
                      longitude: marker.lng,
                    }}
                  />
                )}
              </MapView>
              <View style={{ position: 'absolute', top: 10, width: '100%' }}>
                {/* <TextInput
                  style={{
                    borderRadius: 10,
                    margin: 10,
                    color: '#000',
                    borderColor: '#666',
                    backgroundColor: '#FFF',
                    borderWidth: 1,
                    height: 45,
                    paddingHorizontal: 10,
                    fontSize: 18,
                  }}
                  placeholder={'Search'}
                  placeholderTextColor={'#666'}
                /> */}
                <GooglePlacesAutocomplete
                  style={{
                    borderRadius: 10,
                    margin: 10,
                    color: '#000',
                    borderColor: '#666',
                    backgroundColor: '#FFF',
                    borderWidth: 1,
                    height: 45,
                    paddingHorizontal: 10,
                    fontSize: 18,
                  }}
                  placeholder='Search Places'
                  query={{
                    key: GOOGLE_API_KEY,
                    language: 'vi'
                  }}
                  GooglePlacesDetailsQuery={{
                    fields: 'geometry'
                  }}
                  fetchDetails={true}
                  onPress={(data, details) => { this.handleSetMarker(data, details) }}
                  onFail={(error) => console.error(error)}
                />
              </View>
              <View style={{ position: 'absolute', justifyContent: "flex-start", alignSelf: "flex-end", bottom: 35, height: 20 }}>
                <Button
                  style={{ backgroundColor: "blue", width: 50 }}
                  onPress={() => {
                    this.setState({
                      modalMap: !this.state.modalMap,
                      loadingMap: !this.state.loadingMap
                    })
                  }}
                >
                  <Text style={{ fontFamily: 'montserrat-bold', fontSize: 14, color: 'white', textAlign: 'center' }}>OK</Text>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          animationType='slide'
          transparent={true}
          visible={modalAdd}
          // key={this.state.data2['index']}
          onRequestClose={() => { }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                ADD FARM
              </Text>
              <ScrollView keyboardShouldPersistTaps='handled'>
                <Block row>
                  <Image
                    source={Images.FM1}
                    style={styles.ImageClass}
                  />
                  <Text style={styles.TextClass}> Block </Text>
                </Block>
                <Block row>
                  <TextInput
                    style={styles.TextInputClass}
                    placeholder="Input Block name"
                    onChangeText={block_name => this.setState({ block_name })}
                    defaultValue={this.state.block_name}
                  />
                </Block>

                <Block row>
                  <Image
                    source={Images.FM5}
                    style={styles.ImageClass}
                  />
                  <Text style={styles.TextClass}> Area (m2) </Text>
                </Block>
                <Block row>
                  <TextInput
                    style={styles.TextInputClass}
                    placeholder="Input Block Area"
                    onChangeText={block_area => this.setState({ block_area })}
                    defaultValue={this.state.block_area}
                  />
                </Block>

                <Block row>
                  <Image
                    source={Images.FM2}
                    style={styles.ImageClass}
                  />
                  <Text style={styles.TextClass}> Description </Text>
                </Block>
                <Block row>
                  <TextInput
                    style={styles.TextInputClass}
                    multiline
                    numberOfLines={5}
                    placeholder="Input Description"
                    onChangeText={description => this.setState({ description })}
                    defaultValue={this.state.description}
                  />
                </Block>
                <Block row>
                  <Image
                    source={Images.FM3}
                    style={styles.ImageClass}
                  />
                  <Text style={styles.TextClass}> Current Address </Text>
                </Block>
                <Block row>
                  <TextInput
                    style={styles.TextInputClass}
                    placeholder="Click here to Locate"
                    onPress={() => { this.setState({ modalMap: !this.state.modalMap, loadingMap: !this.state.loadingMap }) }}
                    defaultValue={String(this.state.marker.lat).substring(0, 6) + ',' + String(this.state.marker.lng).substring(0, 6)}
                    // onChangeText={block_wealth => this.setState({ block_wealth })}                    
                    showSoftInputOnFocus={false}
                  />
                </Block>
                <Block row>
                  <Image
                    source={Images.FM4}
                    style={styles.ImageClass}
                  />
                  <Text style={styles.TextClass}> BLOCK WEALTH ($)</Text>
                </Block>
                <Block row>
                  <TextInput
                    style={styles.TextInputClass}
                    placeholder="Input Farm Wealth"
                    onChangeText={block_wealth => this.setState({ block_wealth })}
                    defaultValue={this.state.block_wealth}
                  />
                </Block>
                <Block row>
                  <Button
                    // textStyle={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'white' }}
                    style={styles.buttonC}
                    onPress={() => {
                      const {
                        block_name,
                        block_area,
                        description,
                        marker,
                        block_wealth
                      } = this.state

                      const location = String(marker?.lat) + ',' + String(marker?.lng)
                      this.props.onaddFM(block_name, block_area, description, location, block_wealth, dataFarm => {
                        this.setState({
                          dataFarm,
                          modalSuccess: !this.state.modalSuccess
                        }, () => {
                          setTimeout(() => {
                            this.setState({
                              modalSuccess: false
                            })
                          }, 2000)
                        })
                      })
                    }}
                  >
                    <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'white', textAlign: 'center' }}>Add</Text>
                  </Button>
                  <Button
                    textStyle={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'white' }}
                    style={styles.buttonD}
                    onPress={() => {
                      this.setState({
                        modalAdd: !this.state.modalAdd
                      })
                    }}
                  >
                    <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'white', textAlign: 'center' }}>Cancel</Text>
                  </Button>
                </Block>
              </ScrollView>
            </View>
          </View>
        </Modal>     

        <StatusBar hidden />
        <Block flex space="between" style={styles.padded}>
          <Block middle row style={{}}>
            <SafeAreaView style={styles.containerCard}>
              {!isDetail && (
                <View style={styles.containerCard}>
                  <Card containerStyle={styles.containerCard} wrapperStyle={{
                    width: width - theme.SIZES.BASE * 2
                  }}>
                    <Block row>
                      <Text style={{ fontFamily: "montserrat-bold", alignItems: "center", margin: "auto" }}>FARM MANAGEMENTS</Text>
                    </Block>
                    <Block row>
                      <Text style={{ fontFamily: "montserrat-regular", padding: 10 }}> Manage all farm information </Text>
                    </Block>

                    <Block row>
                      <Button
                        // textStyle={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'white' }}
                        style={styles.buttonA}
                        onPress={() => {
                          this.setState({
                            modalDelete: !this.state.modalDelete
                          })
                        }}
                      >
                        <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'white', textAlign: 'center' }}>Delete Farm</Text>
                      </Button>
                      <Button
                        textStyle={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'white' }}
                        style={styles.buttonB}
                        onPress={() => {
                          this.setState({
                            modalAdd: !this.state.modalAdd
                          })
                        }}
                      >
                        <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'white', textAlign: 'center' }}>Add Farm</Text>
                      </Button>
                    </Block>
                  </Card>
                  <Card containerStyle={styles.containerCard} wrapperStyle={{
                    width: width - theme.SIZES.BASE * 4,
                    height: 550
                  }} >
                    <Block row>
                      <Text style={{ fontFamily: 'montserrat-bold', fontSize: 12, color: 'black', textAlign: 'center' }}>FARM DT01</Text>
                    </Block>
                    <Block row>
                      <Text style={{ fontFamily: 'montserrat-regular', fontSize: 12, color: 'black', textAlign: 'center' }}>08 Feb 2024 10:00 AM</Text>
                    </Block>
                    <ScrollView style={{ flex: 0 }}>
                      {!isLoading && (
                        dataFarm?.map((data, index) => {
                          return <Block key={index} row style={{ paddingBottom: 5 }}>
                            <TouchableOpacity onPress={() => {
                              console.log(data.status)
                              this.setState({
                                isDetail: true,
                                blockSelected: data.block_name,                                
                              })
                            }}>
                              <View style={{ backgroundColor: "rgba(0,133,117,0.25)", width: width - theme.SIZES.BASE * 4, borderRadius: 10 }}>
                                <Text style={{ fontFamily: 'montserrat-bold', fontSize: 16, color: 'black', margin: 10 }}>{data.block_name}</Text>
                                <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: 'black', marginLeft: 10, marginBottom: 5 }}>AREA: {data.block_area} m2</Text>
                                <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: 'black', marginLeft: 10, marginBottom: 5 }}>Person In Charge: DANH</Text>
                                <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: 'black', marginLeft: 10, marginBottom: 5 }}>STATUS: {data.status}</Text>
                                <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: 'black', marginLeft: 10, marginBottom: 5 }}>BLOCK WEALTH: {data.block_wealth}$</Text>
                                <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: 'black', marginLeft: 10, marginBottom: 5 }}>ACTION: {data.action}</Text>
                                <Block row>
                                  <Image
                                    source={Images.FM6}
                                    style={styles.ImageClass}
                                  />
                                  <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: 'black', marginTop: 10 }}>Duc Trong, Lam Dong</Text>
                                </Block>
                              </View>
                            </TouchableOpacity>
                          </Block>
                        })
                      )}
                    </ScrollView>
                  </Card>
                </View>
              )}
              {(isDetail && !isViewDetail) && (
                <View style={{ width: width - theme.SIZES.BASE * 2, height: 800 }}>
                  <Block row>
                  <Button
                    style={{ backgroundColor: "#30E5D0", width: 40, marginTop: 20}}
                    onPress={() => {
                      this.setState({
                        isDetail: !this.state.isDetail
                      })
                    }}
                  >
                    <Image
                      source={Images.FM8}
                      style={{ width:30}}
                      resizeMode="contain"
                    />                    
                  </Button>
                  <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'black', textAlign: "center", marginTop: 30 }}>Farm Management</Text>
                  </Block>
                  <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'black', textAlign: "center" }}>FARM DT01</Text>
                  <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: 'black', textAlign: "center" }}>{this.state.blockSelected}</Text>
                  <ScrollView>
                    {dataIMG?.map((data, index) => {
                      return <TouchableOpacity 
                      key={index} 
                      onPress={() => {
                        console.log(data.count)
                        this.setState({
                          // modalViewImage: !this.state.modalViewImage,
                          // modalImage: !this.state.modalImage
                          imageSelected: data.file_path_process,
                          statusSelected: data.status,
                          countSelected: data.count,
                          isViewDetail: !this.state.isViewDetail
                      })
                      
                    }}
                      > 
                        <Block row style={{}}>
                          <Image
                            style={{ height: 100, width: 100 }}
                            source={{
                              uri: `http://ai.ailab.vn:5004/image?file_path=${data.file_path_process}`
                            }}
                          />
                          <Block row>
                            <Text style={{ fontFamily: 'montserrat-regular', fontSize: 16, color: 'black', marginLeft: 10 }}>
                            {data.created_date}
                              {`\n`}
                              <Text style={{ fontFamily: 'montserrat-bold', fontSize: 14, color: 'black' }}>
                                {data.status}
                              </Text>
                              {`\n`}
                              {`\n`}
                              <Button style={{ backgroundColor: "#C0FCE3" }} disabled>
                                <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: 'black' }}>
                                  Complete
                                </Text>
                              </Button>
                              {`\n`}
                            </Text>
                            <Image
                              source={Images.FM7}
                              style={{ width: 50, paddingTop: 30, marginLeft: 30 }}
                            />
                          </Block>
                        </Block>
                      </TouchableOpacity>
                    })}
                    

                    <TouchableOpacity>
                      <Block row style={{}}>
                        <Image
                          style={{ height: 100, width: 100 }}
                          source={{
                            uri: uri_test
                          }}
                        />
                        <Block row>
                          <Text style={{ fontFamily: 'montserrat-regular', fontSize: 16, color: 'black', marginLeft: 10 }}>
                            {`2024-11-20 14:49:23`}
                            {`\n`}
                            <Text style={{ fontFamily: 'montserrat-bold', fontSize: 14, color: 'black' }}>
                              Unhealthy
                            </Text>
                            {`\n`}
                            {`\n`}
                            <Button style={{ backgroundColor: "#C0FCE3" }} disabled>
                              <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: 'black' }}>
                                Complete
                              </Text>
                            </Button>
                            {`\n`}
                          </Text>
                          <Image
                            source={Images.FM7}
                            style={{ width: 50, paddingTop: 30, marginLeft: 30 }}
                          />
                        </Block>
                      </Block>
                    </TouchableOpacity>

                    <TouchableOpacity>
                      <Block row style={{}}>
                        <Image
                          style={{ height: 100, width: 100 }}
                          source={{
                            uri: uri_test
                          }}
                        />
                        <Block row>
                          <Text style={{ fontFamily: 'montserrat-regular', fontSize: 16, color: 'black', marginLeft: 10 }}>
                            {`2024-11-20 14:49:23`}
                            {`\n`}
                            <Text style={{ fontFamily: 'montserrat-bold', fontSize: 14, color: 'black' }}>
                              Unhealthy
                            </Text>
                            {`\n`}
                            {`\n`}
                            <Button style={{ backgroundColor: "rgba(250,28,28,0.3)" }} disabled>
                              <Text style={{ fontFamily: 'montserrat-regular', fontSize: 14, color: '#FA1C1C' }}>
                                Incomplete
                              </Text>
                            </Button>
                            {`\n`}
                          </Text>
                          <Image
                            source={Images.FM7}
                            style={{ width: 50, paddingTop: 30, marginLeft: 30 }}
                          />
                        </Block>
                      </Block>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}
              {(isDetail && isViewDetail) && (
                <View style={{ width: width - theme.SIZES.BASE * 2, height: 800 }}>
                  <Block row>
                    <Button
                      style={{ backgroundColor: "#30E5D0", width: 40 }}
                      onPress={() => {
                        this.setState({
                          isViewDetail: !this.state.isViewDetail
                        })
                      }}
                    >
                      <Image
                        source={Images.FM8}
                        style={{ width: 30 }}
                        resizeMode="contain"
                      />
                    </Button>
                    <Text style={{ fontFamily: 'montserrat-bold', fontSize: 16, color: 'black', textAlign: 'center', marginTop: 20 }}>FARM DT01</Text>
                  </Block>
                  {(statusSelected === 'Good') && (
                    <ScrollView>                    
                    <Block row>
                      <Image
                        source={Images.FM9}
                        style={{ width: 100 }}
                        resizeMode="contain"
                      />
                    </Block>
                    <Block row>
                      <View style={{ width: width - theme.SIZES.BASE * 3, backgroundColor: "rgba(175,245,237,0.25)" }}>
                        <Text style={{ fontFamily: 'montserrat-bold', fontSize: 20, color: '#008575', margin: 10 }}>Congratulations!!</Text>                        
                        <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'black', margin: 10 }}>Your plant is healthy.</Text>
                        <Image 
                          style={{ height: 30}}
                          source={Images.FM12}
                          resizeMode="contain"
                        />
                        <TouchableOpacity
                          onPress={() => {
                            this.setState({
                              // modalViewImage: !this.state.modalViewImage,
                              modalImage: !this.state.modalImage
                            })
                          }}
                          >
                          <Image
                            style={{ width: 300, height: 300, transform: [{ rotate: '90deg' }], marginLeft: 30, marginBottom: 15 }}
                            source={{
                              uri: `http://ai.ailab.vn:5004/image?file_path=${imageSelected}`
                              // uri: uri_test
                            }}
                          // resizeMode="contain"
                          />
                          <ImageView
                            images={[{ uri: `http://ai.ailab.vn:5004/image?file_path=${imageSelected}` }]}
                            imageIndex={0}
                            visible={this.state.modalImage}
                            onRequestClose={() => this.setState({
                              modalImage: false,
                              // modalViewImage: false
                            })}
                          />
                        </TouchableOpacity>
                      </View>
                    </Block>
                    <Block row>
                      <Image
                        source={Images.FM10}
                        style={{ width: 250 }}
                        resizeMode="contain"
                      />
                    </Block>
                    <Block row>
                      <View style={{ width: width - theme.SIZES.BASE * 3, backgroundColor: "rgba(175,245,237,0.25)" }}>
                        <Block row>
                          <Image
                            source={Images.FM11}
                            style={{ width: 50 }}
                            resizeMode="contain"
                          />
                          <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'black', marginTop: 25 }}>Tips</Text>
                        </Block>
                        <Block row>
                          <Text style={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black', margin: 10 }}>
                            • Cotton needs warm soil to germinate. Do not allow chilling injury to seeds....
                            {`\n`}
                            {`\n`}
                            • Be aware of early season insects.
                            {`\n`}
                            {`\n`}
                            • Choose cotton varieties that are well-adapted to your region and climate.
                            {`\n`}
                            {`\n`}
                            • Plant seeds when soil temperatures have warmed up to at least 60°F (15°C).
                            {`\n`}
                            {`\n`}
                            • Conduct soil tests to assess nutrient levels and pH. Cotton prefers well-drained soils with a pH between 5.8 and 6.5.
                          </Text>
                        </Block>
                      </View>
                    </Block>
                    </ScrollView>
                  )}                  
                  {(statusSelected === 'Unhealthy') && (
                    <ScrollView>                    
                    <Block row>
                      <Image
                        source={Images.FM9}
                        style={{ width: 100 }}
                        resizeMode="contain"
                      />
                    </Block>
                    <Block row>
                      <View style={{ width: width - theme.SIZES.BASE * 3, backgroundColor: "rgba(250,28,28,0.1)" }}>
                        <Text style={{ fontFamily: 'montserrat-bold', fontSize: 20, color: '#FA1C1C', margin: 10 }}>OOPS!!</Text>
                        {/* <Text>{`\n`}</Text> */}
                        <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'black', margin: 10 }}>Your plant is harmful.</Text>
                        <Image 
                          style={{ height: 30}}
                          source={Images.FM12}
                          resizeMode="contain"
                        />
                        <TouchableOpacity
                          onPress={() => {
                            this.setState({
                              // modalViewImage: !this.state.modalViewImage,
                              modalImage: !this.state.modalImage
                            })
                          }}
                          >
                          <Image
                            style={{ width: 300, height: 300, transform: [{ rotate: '90deg' }], marginLeft: 30, marginBottom: 15 }}
                            source={{
                              uri: `http://ai.ailab.vn:5004/image?file_path=${imageSelected}`
                              // uri: uri_test
                            }}
                          // resizeMode="contain"
                          />
                          {Object.entries(countSelected).map((data,index) => {
                            return <>
                            <Text style={{fontFamily: 'montserrat-bold', fontSize: 18, color: 'black', marginLeft: 30, marginBottom: 5}}>{data[0]}: {data[1]}</Text>                            
                            </>
                          })}                      
                          <ImageView
                            images={[{ uri: `http://ai.ailab.vn:5004/image?file_path=${imageSelected}` }]}
                            imageIndex={0}
                            visible={this.state.modalImage}
                            onRequestClose={() => this.setState({
                              modalImage: false,
                              // modalViewImage: false
                            })}
                          />
                        </TouchableOpacity>
                      </View>
                    </Block>
                    <Block row>
                      <Image
                        source={Images.FM10}
                        style={{ width: 250 }}
                        resizeMode="contain"
                      />
                    </Block>
                    <Block row>
                      <View style={{ width: width - theme.SIZES.BASE * 3, backgroundColor: "rgba(175,245,237,0.25)" }}>
                          <Block row>
                            <Image
                              source={Images.FM11}
                              style={{ width: 50 }}
                              resizeMode="contain"
                            />
                            <Text style={{ fontFamily: 'montserrat-bold', fontSize: 18, color: 'black', marginTop: 25 }}>Tips</Text>
                          </Block>
                          <Block row>
                            <Text style={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black', margin: 10 }}>
                              • Cotton needs warm soil to germinate. Do not allow chilling injury to seeds....
                              {`\n`}
                              {`\n`}
                              • Be aware of early season insects.
                              {`\n`}
                              {`\n`}
                              • Choose cotton varieties that are well-adapted to your region and climate.
                              {`\n`}
                              {`\n`}
                              • Plant seeds when soil temperatures have warmed up to at least 60°F (15°C).
                              {`\n`}
                              {`\n`}
                              • Conduct soil tests to assess nutrient levels and pH. Cotton prefers well-drained soils with a pH between 5.8 and 6.5.
                            </Text>
                          </Block>
                        </View>
                      </Block>
                    </ScrollView>
                  )}

                </View>
              )}              

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
    );
  }

  componentDidMount() {
    this.props.onfetchFM(dataFarm => {
      this.setState({
        dataFarm,
        // isLoading: false
      }, () => {
        // console.log(dataFarm)
        this.props.onfetchIMG(dataIMG => {
          console.log(dataIMG)
          this.setState({
            dataIMG,
            isLoading: false
          }, () => {
            setInterval(() => {
              // console.log(new Date().toLocaleString())
              this.setState({
                time: new Date(Date.now()).toLocaleTimeString(),
                date_current: new Date(Date.now()).toLocaleDateString(),
              })
            }, 1000)
          })
        })
      })
    })
  }

  componentWillUnmount() {
    clearInterval(this.time, this.date_current)
  }

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.WHITE,
  },
  containerCard: {
    // flex: 1,
    width: width - theme.SIZES.BASE * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCard: {
    backgroundColor: '#ecf0f1',
    flexDirection: "row",
    color: "red",
    height: 50,
    alignContent: "center",
    justifyContent: "space-between",
    // textAlignVertical: "center"
  },
  titleCard2: {
    backgroundColor: '#ecf0f1',
    flexDirection: "row",
    color: "blue",
    height: 50,
    alignContent: "center",
    justifyContent: "space-between",
    // textAlignVertical: "center"
  },
  paragraph: {
    margin: 8,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
  padded: {
    top: 10,
    paddingHorizontal: theme.SIZES.BASE * 1.5,
    position: 'absolute',
    bottom: theme.SIZES.BASE,
    zIndex: 2,
    // marginBottom: 50
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 6,
    backgroundColor: '#3b5998',
    color: theme.COLORS.WHITE,
  },
  title: {
    marginTop: "-5%"
  },
  subTitle: {
    marginTop: 20
  },
  pro: {
    backgroundColor: nowTheme.COLORS.BLACK,
    paddingHorizontal: 8,
    marginLeft: 3,
    borderRadius: 4,
    height: 22,
    marginTop: 0
  },
  font: {
    fontFamily: 'montserrat-bold'
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
    // alignItems: 'center',
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
    fontFamily: "montserrat-bold",
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: '#008575'
  },
  TextClass: {
    fontFamily: "montserrat-bold",
    fontSize: 18,
    textAlign: 'center',
    margin: 5
    // color: '#008575'
  },
  ImageClass: {
    height: 30,
    width: 30,
    resizeMode: 'contain',
    margin: 5
    // width: width - theme.SIZES.BASE * 2
  },
  TextInputClass: {
    fontFamily: "montserrat-regular",
    fontSize: 18,
    padding: 10,
    width: "75%",
    borderWidth: 0.5,
    borderRadius: 50
    // color: '#008575'
  },
  buttonA: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 4,
    backgroundColor: '#850000',
    color: theme.COLORS.WHITE,
    borderRadius: 50
  },
  buttonB: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 4,
    backgroundColor: '#008575',
    color: theme.COLORS.WHITE,
    borderRadius: 50
  },
  buttonC: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 4,
    backgroundColor: '#008575',
    color: theme.COLORS.WHITE,
    borderRadius: 50
  },
  buttonD: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 4,
    backgroundColor: 'grey',
    color: theme.COLORS.WHITE,
    borderRadius: 50
  },
  // map: {
  //   width: "100%",
  //   height: "95%"
  // },
  map: {
    width: "100%",
    height: "95%",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // position:'absolute' 
  },
  searchBar: {
    description: {
      fontWeight: "bold"
    },
    predefinedPlacesDescription: {
      color: "red"
    },
    textInputContainer: {
      backgroundColor: '#369',
      top: 50,
      width: screenWidth - 20,
      borderWidth: 0
    },
    textInput: {
      marginLeft: 0,
      marginRight: 0,
      height: 38,
      color: '#5d5d5d',
      fontSize: 16,
      borderWidth: 0
    },
    listView: {
      backgroundColor: 'rgba(192,192,192,0.9)',
      top: 23
    }
  }
});

const mapStateToProps = state => {
  return {
    auth: state.auth,
    errors: state.errors,
    user: state.user
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onfetchFM: (callback) => {
      dispatch(fetchFM(callback))
    },
    onaddFM: (block_name, block_area, description, location, block_wealth, callback) => {
      dispatch(addFM(block_name, block_area, description, location, block_wealth, callback))
    },
    onfetchIMG: (callback) => {
      dispatch(fetchIMG(callback))
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FM);