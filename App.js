import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image } from 'react-native';

import HomePage from './HomePage.js';
import Login from './Login.js';
import SignUp from './SignUp.js';
import Friends from './Friends.js';
import Search from './Search.js';
import Account from './Account.js';
import LogOut from './LogOut.js';
import User from './User.js';
import Post from './Post.js';
import Requests from './Requests.js';
import TakePhoto from './TakePhoto.js';

const homeImage = require('./home.png')
const friendsImage = require('./friends.png')
const searchImage = require('./search.png')

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();



function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="LoggedIn" component={LoggedIn} />
        <Stack.Screen name="User" component={User} options={{headerShown:true}}/>
        <Stack.Screen name="Post" component={Post} options={{headerShown:true}}/>
        <Stack.Screen name="Requests" component={Requests} options={{headerShown:true}}/>
        <Stack.Screen name="TakePhoto" component={TakePhoto} options={{headerShown:true}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


function LoggedIn() {
  return (
    <Tab.Navigator screenOptions={{tabBarActiveBackgroundColor:"#505050",tabBarShowLabel:false,tabBarStyle: { backgroundColor: "white" }}}>
      <Tab.Screen name="HomePage" component={HomeScreen} options={{headerShown:false, tabBarIcon: () => (
        <Image style={{ width: 30, height: 30 }} source={homeImage} />)}}/>
      <Tab.Screen name="Friends" component={Friends} options={{headerShown:false, tabBarIcon: () => (
        <Image style={{ width: 30, height: 30 }} source={friendsImage} />)}}/>
      <Tab.Screen name="Search" component={Search} options={{headerShown:false, tabBarIcon: () => (
        <Image style={{ width: 30, height: 30 }} source={searchImage} />)}}/>
    </Tab.Navigator>
  );
}

function HomeScreen(){
  return (
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomePage} />
        <Drawer.Screen name="Account" component={Account} />
        <Drawer.Screen name="LogOut" component={LogOut} />
      </Drawer.Navigator>
  );
}



export default App;