import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity,Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './HomePage.js';
import SignUp from './SignUp.js';

const image = require('./spacebook.jpg');


function Login({navigation}) {
  const [name, setName] = useState("");
  const [name2, setName2] = useState("");
  return (
    <View style={styles.outerContainer}>
      <View style={styles.Title}>
        <Image source={image} style={{width: 250,height: 250}}></Image>
        <Text style={{fontSize:50, color: '#252525'}}>SPACEBOOK</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Username" onChangeText={(value) => setName(value)}/>
        <TextInput style={styles.input} placeholder="Password" onChangeText={(value) => setName2(value)}/>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.touchableOpacity} onPress={() => navigation.navigate('HomePage')}>
          <Text style={styles.buttonText}>
            Log In
          </Text> 
        </TouchableOpacity>
        <TouchableOpacity style={styles.touchableOpacity} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.buttonText}>
            Sign Up
          </Text> 
        </TouchableOpacity>
      </View>
    </View>
  );
}







const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="HomePage" component={HomePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}





export default App;


const styles = StyleSheet.create({
  outerContainer: {
    width: 393,
    height: 851,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  inputContainer:{
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  Title:{
    marginTop:50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input:{
    width:300,
    height:40,
    alignItems:'center',
    border: 'solid',
    borderRadius: 100,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  touchableOpacity:{
    width: 130,
    height: 20,
    marginTop:10,
    border: 'solid',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#252525",
  },
  buttonText:{
    color: "white",
  },
});
