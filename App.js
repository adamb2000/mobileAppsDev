import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity,Image } from 'react-native';
const image = require('./spacebook.jpg');


export default function App() {
  const [name, setName] = useState("");
  const [name2, setName2] = useState("");
  return (
    <View style={styles.outerContainer}>
      <View style={styles.Title}>
        <Text style={{fontSize:50}}>SPACEBOOK</Text>
        <Image source={{ uri: 'https://lco.global/static/img/Space-Book-Logo.06e53df5029e.jpg' }} style={{width: 300,height: 200}}></Image>
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


const styles = StyleSheet.create({
  outerContainer: {
    width: 393,
    height: 851,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer:{
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 150,
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
