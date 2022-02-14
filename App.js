import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';



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


const image = require('./spacebook.jpg');

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}


function LoggedIn() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomePage" component={HomeScreen} options={{headerShown:false}}/>
      <Tab.Screen name="Friends" component={Friends} options={{headerShown:false}}/>
      <Tab.Screen name="Search" component={Search} options={{headerShown:false}}/>
      
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