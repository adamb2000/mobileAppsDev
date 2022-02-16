import React , { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const image = require('./spacebook.jpg');



function Account({navigation}) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [photo,setPhoto]=useState(null);

  const [newFirstName, setNewFirstName] = useState("");
  const [newSecondName, setNewSecondName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState(1);
  const [token,setToken] = useState("");
  const [ID,setID] = useState("");


  
  useEffect(()=>{
    AsyncStorage.getItem('id').then((value)=>setID(value));
    AsyncStorage.getItem('token').then((value)=>setToken(value));
  },[]);

  useEffect(() => { 
    if(token != ""){
      getData();
    }
 },[token]);



  if(loaded){
    return (
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.outerContainer}>
          <View style={styles.Title}>
            <Text style={{fontSize:50, color: '#252525'}}>Account</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image source={photo} style={{width: 100,height: 100}}></Image>
            <TouchableOpacity style={styles.touchableOpacity} onPress={takePhoto}>
              <Text style={styles.buttonText}>TakePhoto</Text> 
            </TouchableOpacity>
          </View>
          <View style={styles.innerContainer}>
            <Text style={styles.text}>Current Details:</Text>
            <Text style={styles.text}>First Name: {firstName}</Text>
            <Text style={styles.text}>Second Name: {secondName}</Text>
            <Text style={styles.text}>Email Address: {email}</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} placeholder="First Name" onChangeText={(value) => setNewFirstName(value)}/>
              <TextInput style={styles.input} placeholder="Second Name" onChangeText={(value) => setNewSecondName(value)}/>
              <TextInput style={styles.input} placeholder="Email" onChangeText={(value) => setNewEmail(value)}/>
              <TextInput style={styles.input} placeholder="Password" onChangeText={(value) => setNewPassword(value)}/>
            </View>
            <TouchableOpacity style={styles.touchableOpacity} onPress={updateUserInfo}>
              <Text style={styles.buttonText}>Submit New Details</Text> 
            </TouchableOpacity>
            {warning()}
          </View>
        </View>
      </ScrollView>
    );
  }
  else{
    return(
      <View><Text>Loading</Text></View>
    )
  }




  function takePhoto(){
    console.log("phoho");
  }



  async function updateUserInfo(){
    const response = await fetch("http://localhost:3333/api/1.0.0/user/"+ID,{
        method: 'PATCH',
        headers: {
            'X-Authorization': token,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            first_name: newFirstName,
            last_name:  newSecondName,
            email: newEmail,
            password: newPassword,
        })
    });
    if(response.status != 200){
      setStatus(3);
    }
    else{
      setStatus(2);
    }
    
  }


  function warning(){
    if(status == 2){
      return(
        <Text>Success</Text>
      )
    }
    else if(status ==3){
      return (
        <Text>Error</Text>
      )
    }
  }





  async function getData(){
    const token = await AsyncStorage.getItem('token');
    const id = await AsyncStorage.getItem('id');

    const response = await fetch("http://localhost:3333/api/1.0.0/user/"+id,{
        method: 'GET',
        headers: {
            'X-Authorization': token
        },
    });
    if(response.status==200){
      const body = await response.json();
      setFirstName(body.first_name);
      setSecondName(body.last_name);
      setEmail(body.email);
      setLoaded(true);
    }
    else{
      console.log(response);
    }
    const imageResponse = await fetch("http://localhost:3333/api/1.0.0/user/"+ID+"/photo",{
      method: 'GET',
      headers:{
        'X-Authorization': token
      },
    });
    if(imageResponse.status == 200)
    {
      const body = await imageResponse.blob();
      setPhoto(URL.createObjectURL(body));
    }
  }


}


const styles = StyleSheet.create({
    outerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex:1,
      backgroundColor: 'white',
    },
    innerContainer:{
      alignItems: 'center',
      flex:6,
    },
    Title:{
      flex:1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageContainer:{
      flex:2,
      alignItems: 'center',
      justifyContent: 'center',
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
    inputContainer:{
      marginTop:50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    touchableOpacity:{
      width: 130,
      height: 20,
      marginTop:10,
      marginBottom:20,
      border: 'solid',
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: "#252525",
    },
    buttonText:{
      color: "white",
    },
    text:{
      color: "#252525",
      fontSize:20,
    },
  });
  
  export default Account;