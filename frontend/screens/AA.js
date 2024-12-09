import { Camera, CameraType, FlashMode } from 'expo-camera'
import Constants from 'expo-constants'
import React, { Fragment, useState } from 'react'
import {
  StyleSheet,
  View,
  Dimensions,

} from 'react-native'

import { GiftedChat } from 'react-native-gifted-chat'

import { Button } from '../components'

import { Block, theme, Text as GText } from 'galio-framework'
import { Amplify, Auth, Storage } from 'aws-amplify'
import awsconfig from './aws-exports'
import { useNavigation } from '@react-navigation/native';

Amplify.configure(awsconfig)

const { width } = Dimensions.get('screen')

export default function AA () {
  const [messages, setMessages] = useState([
    {
          _id: 1,
          text: 'Hello. I am Aquaculture Assistant. What can I help you ?',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
  ])  
  // constructor (props) {
  //   super(props)
  //   this.onSend = this.onSend.bind(this)
  //   this.state = {
  //     isLoading: false,
  //     messages: [
  //       {
  //         _id: 1,
  //         text: 'Hello developer',
  //         createdAt: new Date(),
  //         user: {
  //           _id: 2,
  //           name: 'React Native',
  //           avatar: 'https://placeimg.com/140/140/any',
  //         },
  //       },
  //     ],
  //     botMessage: [{}],
  //     newMessage: ""
  //   }
  // }

  const onSend = async (newMessages = []) => {    

    try{
      // const response = await axios({
      //   method: 'post',
      //   url: 'https://api.openai.com/v1/completions',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization':  ''
      //   },
      //   data: {
      //     model: "ada:ft-data-science-lab-2023-09-19-05-56-08",
      //     prompt: messages,
      //     max_tokens: 12,
      //     temperature: 0.6
      //   }
      // })

      const userMessage = newMessages[0]

      setMessages(previousMessages => GiftedChat.append(previousMessages, userMessage))
      const messageText = userMessage.text.toLowerCase()

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "",
        },
        body: JSON.stringify({
          model: "ada:ft-data-science-lab-2023-09-19-05-56-08",
          prompt: messageText,
          max_tokens: 1024,
          temperature: 0.5,
          n:1,
          stop: null,

        }),
      }

      fetch("https://api.openai.com/v1/completions", requestOptions)
      .then(async (response) => {
        // res.send();        

        const data = await response.json()
        console.log(data.choices[0].text.split('\n')[0])
        const botMessage = {
          _id: new Date().getTime() + 1,
          text: data.choices[0].text.split('\n')[0],
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Aqua Assistant'
          }
        }

        // console.log(data['choices'][0]['text'])
        setMessages(previousMessages => GiftedChat.append(previousMessages, botMessage))
        
      })
      .catch((error) => {
        console.error("Error on request:", error);
      });
      
  
    }catch (error) {
      console.log(error.message)
    }

  }
      const navigation = useNavigation()
      return (
        <View flex style={styles.container}>        
          <Block flex space='between' style={styles.padded}>          
          <Button
            textStyle={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black' }}
            style={styles.buttonA}
            onPress={() => navigation.navigate('Onboarding', { isReload: false })}
          >
            Pond Environment
          </Button>
          
            <Block flex style={{flex:1, height: 300}}>
            <GiftedChat
            messages={messages}
            onSend={newMessages => onSend(newMessages)}
            user={{
              _id: 1,
            }}
          />   
          </Block>
          </Block>                                     
        </View>
      )    
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
    backgroundColor: '#F5A89A',
    color: theme.COLORS.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15
  },
  buttonB: {
    height: theme.SIZES.BASE * 6,
    backgroundColor: 'White',
    color: theme.COLORS.BLACK
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
    height: 250
  },
  padded: {
    top: 20,
    // paddingHorizontal: theme.SIZES.BASE * 1.5,
    // position: 'absolute',
    bottom: theme.SIZES.BASE,
    zIndex: 2,
    marginBottom: 150
  }
})
