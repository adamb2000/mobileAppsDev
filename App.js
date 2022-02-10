
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomePage from './HomePage.js';
import Login from './Login.js';
import SignUp from './SignUp.js';

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
        <Stack.Screen name="HomePage" component={LoggedIn} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


function LoggedIn() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomePage" component={HomeScreen} options={{headerShown:false}}/>
    </Tab.Navigator>
  );
}

function HomeScreen(){
  return (
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomePage} />
      </Drawer.Navigator>
  );
}


export default App;