import React , { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const image = require('./spacebook.jpg');



function Account({navigation}) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [loaded, setLoaded] = useState(false);
  
  useEffect(()=>{
    getData();
  },[]);

  if(loaded){
    return (
      <ScrollView>
        <View style={styles.outerContainer}>
          <View style={styles.Title}>
            <Text style={{fontSize:50, color: 'blue'}}>Account</Text>
          </View>
          <View style={styles.innerContainer}> 
            <Text>Welcome: {firstName}</Text>
            <Text>Welcome: {secondName}</Text>
          </View>
          <View style={styles.bottomNavigation}>
            <Text style={{fontSize:50, color: 'blue'}}>Account</Text>
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


const styles = StyleSheet.create({
    outerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex:1,
      backgroundColor:'yellow',
    },
    bottomNavigation:{
      flex:1,
      backgroundColor:'red',
    },
    innerContainer:{
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 100,
      flex:4,
      backgroundColor:'blue',
    },
    Title:{
      flex:1,
      marginTop:50,
      backgroundColor:'red',
    },
  });
  
  export default Account;