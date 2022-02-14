import React , { useEffect, useState } from 'react';
import { StyleSheet, Text, View,FlatList, ScrollView, TextInput, TouchableOpacity,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const image = require('./spacebook.jpg');



function Search({navigation}) {
  const [token,setToken] = useState("");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(1);
  const [dataArray, setDataArray]=useState([]);
  const [refresh, setRefresh] = useState(true);


  useEffect(()=>{
    AsyncStorage.getItem('token').then((value)=>setToken(value));
  },[]);

  useEffect(() => { 
    if(token != ""){
      getSearchData();
    }
 },[token]);



  if(loaded==3){
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={{fontSize:30,}}>Search For New Friends</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Search" onChangeText={(value) => setSearch(value)}/>
        </View>
        <TouchableOpacity style={styles.touchableOpacity} onPress={() => {getSearchData()}}>
          <Text style={styles.buttonText}>Search</Text> 
        </TouchableOpacity>
        <View style={styles.innerContainer}> 
          <FlatList style={styles.flatList}          
            data={dataArray} extraData={refresh} 
            renderItem={({item}) => 
            <View style={styles.listView}>
              <TouchableOpacity style={styles.userTouchableOpacity} onPress={() => {navigateUser(item.key)}}>
                <Text style={styles.listTextName}>{item.fName} {item.sName}</Text>
                <Text style={styles.listText}>{item.email}</Text>
              </TouchableOpacity>
            </View>
          }/>
        </View>
      </View>
    );
  }
  else if(loaded==2){
    return(
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={{fontSize:30}}>Search For New Friends</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Search" onChangeText={(value) => setSearch(value)}/>
        </View>
        <TouchableOpacity style={styles.touchableOpacity} onPress={() => {getSearchData()}}>
          <Text style={styles.buttonText}>Search</Text> 
        </TouchableOpacity>
        <View style={styles.innerContainer}> 
          <Text>No Results</Text>
        </View>
      </View>
    )
  }
  else{
    return(
      <View><Text>Loading</Text></View>
    )
  }


  function navigateUser(userID){
    navigation.navigate('User', {userID });
  }

  async function getSearchData(){
    const response = await fetch("http://localhost:3333/api/1.0.0/search?search_in=all&limit=20&offset=0&q="+search,{
      method: 'GET',
      headers: {
        'X-Authorization': token
      },
    });
    if(response.status ==200){
      const body = await response.json();
      if(body.length>0){
        setDataArray([]);
        for(let i=0;i<body.length;i++){
          let key = body[i].user_id;
          let fName = body[i].user_givenname;
          let sName = body[i].user_familyname;
          let email = body[i].user_email;
          setDataArray(old => [...old,{key,fName,sName,email}]);
        }
        setLoaded(3);
        setRefresh(!refresh);
      }
      else{
        setLoaded(2) ;
      }
    }
    else{
      setLoaded(1); 
    }
  }

}



const styles = StyleSheet.create({
    outerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex:1,
      backgroundColor:'white',
    },
    innerContainer:{
      alignItems: 'center',
      justifyContent: 'center',
      flex:8,
      minWidth: '100%',
      marginTop:10,
    },
    Title:{
      flex:1,
      paddingTop: 20,
    },
    flatList:{
      minWidth: '100%',
      flex:1,
      padding:5,
    },
    listView:{
      borderWidth: 3,
      borderRadius: 10,
      marginBottom: 4,
      padding: 5,
      minWidth: '100%',
    },
    listTextName:{
      fontSize:10,
    },
    listText:{
      fontSize:20,
    },
    listButtonView:{
      alignItems: "center", 
      marginTop:5,
      flex: 1,
      flexDirection: 'row'
    },
    inputContainer:{
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
    touchableOpacity:{
      width: 130,
      height: 20,
      marginTop:5,
      border: 'solid',
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: "#252525",
    },
    userTouchableOpacity:{
      flex:1,
      backgroundColor:'blue',
    },
    buttonText:{
      color: "white",
    },
  });
  
  export default Search;