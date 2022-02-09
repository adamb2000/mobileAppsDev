import { setStatusBarNetworkActivityIndicatorVisible, StatusBar } from 'expo-status-bar';
import React , { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const image = require('./spacebook.jpg');



function HomePage({navigation}) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [loaded, setLoaded] = useState(false);
  
  useEffect(()=>{
    getData();
  },[]);
  
  if(loaded){
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={{fontSize:50, color: 'blue'}}>SPACEBOOK</Text>
        </View>
        <View style={styles.innerContainer}> 
          <Text>Welcome: {firstName}</Text>
          <Text>Welcome: {secondName}</Text>
        </View>
      </View>
    );
  }
  else{
    return(
      <View><Text>Loading</Text></View>
    )
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
      setLoaded(true);
    }
    else{
      console.log(response);
    }
      
    
  }
}

export default HomePage;

const styles = StyleSheet.create({
  outerContainer: {
    width: 393,
    height: 851,
    backgroundColor: 'Black',
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
