import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity,Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const image = require('./spacebook.jpg');


function Login() {
  const [name, setName] = useState("");
  const [name2, setName2] = useState("");
  return (
    <View style={styles.outerContainer}>
      <View style={styles.Title}>
        <Text style={{fontSize:50, color: 'blue'}}>SPACEBOOK</Text>
        <Image source={{ uri: 'https://lco.global/static/img/Space-Book-Logo.06e53df5029e.jpg' }} style={{width: 250,height: 250}}></Image>
      </View>
      <View style={styles.innerContainer}>
        <TextInput style={styles.input} placeholder="Username" onChangeText={(value) => setName(value)}/>
        <TextInput style={styles.input} placeholder="Password" onChangeText={(value) => setName2(value)}/>
        <TouchableOpacity style={styles.touchableOpacity}>
          <View>
            <Text>
              Log In
            </Text>
          </View>
        </TouchableOpacity>
        <Text>Welcome: {name}</Text>
        <Text>Welcome: {name2}</Text>
      </View>
    </View>
  );
}




const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}





export default App;


const styles = StyleSheet.create({
  outerContainer: {
    width: 393,
    height: 851,
    backgroundColor: 'whiet',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer:{
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 100,
    flex:1,
  },
  Title:{
    flex:1,
    marginTop:50,
  },
  input:{
    width:300,
    height:40,
    alignItems:'center',
    border: 'solid',
    borderRadius: 100,
    marginBottom: 9,
    backgroundColor: 'white',
  },
  touchableOpacity:{
    width: 150,
    border: 'solid',
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: 'red',
  }
});
