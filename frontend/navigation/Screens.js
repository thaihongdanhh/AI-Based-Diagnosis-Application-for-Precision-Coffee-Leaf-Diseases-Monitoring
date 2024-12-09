// drawer
import CustomDrawerContent from "./Menu";
import { Dimensions, Image, } from "react-native";
// header for screens
import Header from "../components/Header";
// screens

import W from "../screens/W";
import PE from "../screens/PE";
import D from "../screens/D";
import FM from "../screens/FM"

import Login from "../screens/Login";
import HomePage from "../screens/HomePage";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { nowTheme } from "../constants";
import Images from "../constants/Images";
import tabs from "../constants/tabs";
import Pro from "../screens/Pro";

const { width } = Dimensions.get("screen");

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function HomeStack(props) {
  return (
    <>
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
      initialRouteName="Home" 
    >       
      <Stack.Screen
        name="Home"
        component={HomePage}
        options={{
          titleColor: "#42a21b",
          header: ({ navigation, scene }) => (
            <Header title="AI DIAGNOSE" navigation={navigation} scene={scene} />
            // <Image style={{              
            //     height: 300,
            //     width: "100%",
            //     resizeMode: 'contain',       
            // }} 
            // source={Images.Logo} />
          ),
          cardStyle: { backgroundColor: "#FFFFFF", paddingTop: 50 }
        }}
      />       
    </Stack.Navigator>    
    </>
  );
}


function DStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
      initialRouteName="D" 
    >       
      <Stack.Screen
        name="D"
        component={D}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="AI DIAGNOSE" navigation={navigation} scene={scene} />            
          ),
          cardStyle: { backgroundColor: "#FFFFFF", paddingTop: 50 }
        }}
      />      
    </Stack.Navigator>
  );
}

function FMStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
      initialRouteName="FM" 
    >       
      <Stack.Screen
        name="FM"
        component={FM}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="AI DIAGNOSE" navigation={navigation} scene={scene} />            
          ),
          cardStyle: { backgroundColor: "#FFFFFF", paddingTop: 50 }
        }}
      />      
    </Stack.Navigator>
  );
}

function WStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen",
      }}
      initialRouteName="W" 
    >       
      <Stack.Screen
        name="W"
        component={W}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="AI DIAGNOSE" navigation={navigation} scene={scene} />            
          ),
          cardStyle: { backgroundColor: "#FFFFFF", paddingTop: 50 }
        }}
      />      
    </Stack.Navigator>
  );
}

function AppStack(props) {
  // console.log(props)
  return (
    <Drawer.Navigator
      style={{ flex: 1 }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      drawerStyle={{
        backgroundColor: nowTheme.COLORS.PRIMARY,
        width: width * 0.8,
      }}
      screenOptions={{
        activeTintcolor: nowTheme.COLORS.WHITE,
        inactiveTintColor: nowTheme.COLORS.WHITE,
        activeBackgroundColor: "transparent",
        itemStyle: {
          width: width * 0.75,
          backgroundColor: "transparent",
          paddingVertical: 16,
          paddingHorizonal: 12,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          overflow: "hidden",
        },
        labelStyle: {
          fontSize: 18,
          marginLeft: 12,
          fontWeight: "normal",
        },
      }}
      initialRouteName="App"
    >
      <Drawer.Screen
        name="HomeDrawer"
        component={HomeStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="FMDrawer"
        component={FMStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="DDrawer"
        component={DStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="WDrawer"
        component={WStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="DODrawer"
        component={HomeStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="NPDrawer"
        component={HomeStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="ODrawer"
        component={HomeStack}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}

export default function OnboardingStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={AppStack}
        option={{
          headerTransparent: true,
        }}
      />
      <Stack.Screen name="App" component={AppStack} />
      {/* <Stack.Screen name="App" component={AppStack} /> */}
      {/* <Stack.Screen name="PE" component={PEStack} /> */}
      {/* <Stack.Screen name="W" component={WStack} />       */}
            
    </Stack.Navigator>
  );
}
