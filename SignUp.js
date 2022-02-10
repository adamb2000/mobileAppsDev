import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity,Image } from 'react-native';
const image = require('./spacebook.jpg');


function SignUp({navigation}) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Image source={image} style={{width: 250,height: 250}}></Image>
          <Text style={{fontSize:50, color: '#252525'}}>SPACEBOOK</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} textAlign='center' placeholder="First Name" onChangeText={(value) => setFirstName(value)}/>
          <TextInput style={styles.input} placeholder="Second Name" onChangeText={(value) => setSecondName(value)}/>
          <TextInput style={styles.input} placeholder="Email" onChangeText={(value) => setEmail(value)}/>
          <TextInput style={styles.input} placeholder="Password" onChangeText={(value) => setPassword(value)}/>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.touchableOpacity} onPress={newUserApiCall}>
          <Text style={styles.buttonText}>
              Submit
            </Text> 
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>
              Back To Login
            </Text> 
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  function newUserApiCall(){
    fetch("http://localhost:3333/api/1.0.0/user",{
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            first_name: firstName,
            last_name:  secondName,
            email: email,
            password: password,
        })
    })
    .then(data => {
        console.log(data);
    });
  }
}




const styles = StyleSheet.create({
  scrollView:{
    flex:1,
    backgroundColor: 'white',
  },
  outerContainer: {
    flex:1,
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
    textAlign: 'center',
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

export default SignUp;