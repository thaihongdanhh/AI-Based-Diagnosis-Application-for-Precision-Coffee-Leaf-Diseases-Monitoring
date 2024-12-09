// import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View , ActivityIndicator, Dimensions, StatusBar } from "react-native";
import * as Location from "expo-location";
import WeatherInfo from '../components/WeatherInfo'
import UnitsPicker from '../components/UnitsPicker'
import ReloadIcon from '../components/ReloadIcon'
import WeatherDetails from '../components/WeatherDetails'
import {colors} from '../utils/index'
import weatherData from './data.json';
import { Button } from '../components'
import { Block, theme } from "galio-framework";
import { useNavigation } from '@react-navigation/native';

const { height, width } = Dimensions.get("screen");

const WEATHER_API_KEY = "53e04e394ce834e3e283355568f6b56b";
const BASE_WEATHER_URL = "https://api.openweathermap.org/data/3.0/onecall?";

export default function App() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [currentWeatherDetails, setCurrentWeatherDetails] = useState(null);
  const [unitsSystem , setUnitsSystem] = useState('metric')
  useEffect(() => {
    load();
  }, [unitsSystem]);
  async function load() {
    setCurrentWeatherDetails(null)
    setCurrentWeather(null)
    setErrorMessage(null)
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status != "granted") {
        setErrorMessage("Access is needed to run the app");
        return;
      }
      // const location = await Location.getCurrentPositionAsync();      
      
      // const { latitude, longitude } = location.coords;
      // const weatherUrl = `${BASE_WEATHER_URL}lat=${latitude}&lon=${longitude}&units=${unitsSystem}&appid=${WEATHER_API_KEY}`;
      // console.log(weatherData)
      // const response = await fetch(weatherUrl)
      // const result = await response.json()
      const result = weatherData
      // console.log(result.current)
      

      // if(response.ok){
      //  setCurrentWeather(result.current.temp)
      //  setCurrentWeatherDetails(result)
      // }
      // else {
      //   setErrorMessage(result.message)
      // }

      setCurrentWeather(result.current.temp)
      setCurrentWeatherDetails(result)

    } catch (error) {
      setErrorMessage(error.message)
    }


  }

  const navigation = useNavigation()
  if(currentWeatherDetails){

    //const  {main : temp} = currentWeather
    return (
      <View style={styles.container}>        
      <Button
                      textStyle={{ fontFamily: 'montserrat-regular', fontSize: 18, color: 'black' }}
                      style={styles.buttonB}
                      onPress={() => navigation.navigate("Onboarding", { isReload: false })}                      
                    >
                      Weather
                    </Button>
        {/* <StatusBar style="auto" /> */}
        <View style={styles.main}>     
        <Block flex>
        <UnitsPicker unitsSystem={unitsSystem} setUnitsSystem={setUnitsSystem}/>        
        <ReloadIcon load={load}/>
        </Block>   
        <Block flex style={{marginTop: 0}}>
          <WeatherInfo currentWeather={currentWeather} currentWeatherDetails={currentWeatherDetails}></WeatherInfo>
        </Block>                
        </View>
        <Block flex style={{paddingBottom: 100}}>
        <WeatherDetails currentWeather={currentWeather} currentWeatherDetails={currentWeatherDetails} unitsSystem={unitsSystem}/>
        </Block>
        
      </View>
    );
  }
  else if(errorMessage){
    return (
      <View style={styles.container}>
        <Text>{errorMessage}</Text>
        <StatusBar style="auto" />
        
      </View>
    );
  } 
  else {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
        <StatusBar style="auto" />
        
      </View>
    );
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  main : {
    flex: 1,
    justifyContent: "center",
  },
  buttonB: {        
    backgroundColor: '#FACE9C',
    width: width - theme.SIZES.BASE * 2,
    height: theme.SIZES.BASE * 3,    
    color: theme.COLORS.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15
  },
});