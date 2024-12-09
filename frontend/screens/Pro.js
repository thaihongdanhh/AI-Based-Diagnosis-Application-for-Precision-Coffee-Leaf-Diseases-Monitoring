import React from "react";
import {
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  SafeAreaView,
  View,
  Text,
  Modal
} from "react-native";
import { Block, theme } from "galio-framework";
import { Button } from '../components';
const { height, width } = Dimensions.get("screen");

import nowTheme from "../constants/Theme";
import Images from "../constants/Images";
import * as Progress from 'react-native-progress'
//import Card
import { Card } from 'react-native-elements';
// import * as Location from 'expo-location';

class Pro extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      time: new Date(Date.now()).toLocaleTimeString(),
      date_current: new Date(Date.now()).toLocaleDateString(),
      modalProcess: false,
    }
  }

  render() {
    const { navigation } = this.props;
    const { time, date_current, modalProcess } = this.state

    return (
      <Block flex style={styles.container}>
        <Modal
                animationType='slide'
                transparent={true}
                visible={modalProcess}
                // key={this.state.data2['index']}
                onRequestClose={() => {}}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.modalText}>
                      On Developing ... Not Available Yet !{' '}
                    </Text>
                    <Block row center space='between'>
                      <Progress.CircleSnail color={['red', 'green', 'blue']} />
                    </Block>
                  </View>
                </View>
              </Modal>
        <StatusBar hidden />
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
                  width: width - theme.SIZES.BASE * 2}}>
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
                      <Text style={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black', textAlign: 'center' }}> Live Camera</Text>
                    </Button>
                    <Button
                      textStyle={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black' }}
                      style={styles.buttonB}
                      onPress={() => navigation.navigate("W", { isReload: false })}                      
                    >
                      Upload Images
                    </Button>
                    </Block>                       
                </Card>
                <Image
                  source={Images.iconBG}
                  style={{
                    height: 400,
                    // marginTop: ,
                    width: 400,
                    resizeMode: 'contain',
                    // width: width - theme.SIZES.BASE * 2
                  }}
                />
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
    );
  }

  componentDidMount (){
    setInterval(() => {
      // console.log(new Date().toLocaleString())
      this.setState({
        time: new Date(Date.now()).toLocaleTimeString(),
        date_current: new Date(Date.now()).toLocaleDateString(),
      })
    }, 1000)    
  }

  componentWillUnmount (){
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
    top: 20,
    paddingHorizontal: theme.SIZES.BASE * 1.5,
    position: 'absolute',
    bottom: theme.SIZES.BASE,
    zIndex: 2,
    marginBottom: 150
  },
  button: {
    width: width - theme.SIZES.BASE * 4,
    height: theme.SIZES.BASE * 6,
    backgroundColor: '#3b5998'
  },
  buttonA: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 6,
    backgroundColor: '#F5A89A',
    color: theme.COLORS.BLACK, 
  },
  buttonB: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 6,
    backgroundColor: '#FACE9C',
    color: theme.COLORS.BLACK, 
  },
  buttonC: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 6,
    backgroundColor: '#74C365',    
    borderWidth: 0,    
  },
  buttonD: {
    width: (width - theme.SIZES.BASE * 4) / 2,
    height: theme.SIZES.BASE * 6,
    backgroundColor: '#D0F0C0',    
    borderWidth: 0,    
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
});

export default Pro;
