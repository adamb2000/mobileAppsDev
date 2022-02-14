import React , { useEffect, useState } from 'react';
import {StyleSheet, Text, View, ScrollView,FlatList, TextInput, TouchableOpacity,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const image = require('./spacebook.jpg');



function HomePage({navigation}) {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [loaded, setLoaded] = useState(1);
  const [newPostData, setNewPostData] = useState("");
  const [refresh, setRefresh] = useState(true);
  const [dataArray,setDataArray]=useState([]);

  
  useEffect(()=>{
    getUserData();
    getPostData();
  },[]);

  if(loaded ==3){
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={{fontSize:40, color: '#252525'}}>{firstName} {secondName}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} textAlign='center' placeholder="Post" onChangeText={(value) => setNewPostData(value)}/>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => {sendNewPostData();getPostData();}}>
            <Text style={styles.buttonText}>Submit Post</Text> 
          </TouchableOpacity>
        </View>
        <View style={styles.innerContainer}>
          <FlatList style={styles.flatList}          
            data={dataArray} extraData={refresh} 
            renderItem={({item}) => 
            <View style={styles.listView}>
              <Text style={styles.listTextName}>{item.fName} {item.sName} at {item.time}</Text>
              <Text style={styles.listText}>{item.text}</Text>
              <View style={styles.listButtonView}>
                <Text>Likes: {item.likes}</Text>
                {getButtons(item,15)}
              </View>
            </View>
          }/>
        </View>
      </View>
    );
  }
  else if(loaded ==2){
    return(
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={{fontSize:40, color: '#252525'}}>My Wall</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} textAlign='center' placeholder="Post" onChangeText={(value) => setNewPostData(value)}/>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => {sendNewPostData();getPostData();}}>
            <Text style={styles.buttonText}>Submit Post</Text> 
          </TouchableOpacity>
        </View>
        <View style={styles.innerContainer}>
          <Text style={{fontSize:10}}>No Posts Yet!</Text>
        </View>
      </View>
    )
  }
  else{
    return(
      <View><Text>Loading</Text></View>
    )
  }






  function getButtons(item,id){
    if(item.userID == id){
      return(
        <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => {editPost(item.key)}}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      )
    }
    else{
      return(
        <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => {likePost(item.key)}}>
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>
      )
    }
  }

  function editPost(key){
    console.log("edit"+key);
  }

  function likePost(item){
    console.log("like");
  }

  async function getUserData(){
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
      
    }
    else{
      console.log(response);
    }
  }

 
  async function getPostData(){
    const token = await AsyncStorage.getItem('token');
    const id = await AsyncStorage.getItem('id');
    console.log(id);
    const response = await fetch("http://localhost:3333/api/1.0.0/user/"+id+"/post",{
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
          let key = body[i].post_id;
          let text = body[i].text;
          let time = body[i].timestamp;
          let likes = body[i].numLikes;
          let fName = body[i].author.first_name;
          let sName = body[i].author.last_name;
          let userID = body[i].author.user_id; 
          setDataArray(old => [...old,{key,text,time,likes,fName,sName,userID}]);
        }
        setLoaded(3)
      }
      else{
        setLoaded(2) 
      }
    }
    else{
        setLoaded(1); 
    }
    setRefresh(!refresh);
  }



  async function sendNewPostData(callback){
    const token = await AsyncStorage.getItem('token');
    const id = await AsyncStorage.getItem('id');

    const response = await fetch("http://localhost:3333/api/1.0.0/user/"+id+"/post",{
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Authorization': token,
      },
      body: JSON.stringify({
        text: newPostData,
      })
    });
    console.log("postdata");
    return response;
  }

}



const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex:1,
    backgroundColor:'white',
    marginLeft:3,
    marginRight:3,
  },
  inputContainer:{
    alignItems: 'center',
    justifyContent: 'center',
    flex: 3
  },
  input:{
    width:300,
    height:40,
    alignItems:'center',
    border: 'solid',
    borderRadius: 100,
    marginBottom: 5,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  innerContainer:{
    alignItems: 'center',
    justifyContent: 'center',
    flex:15,
    minWidth: '100%',
  },
  listView:{
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 3,
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
  Title:{
    flex:2,
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
  listTouchableOpacity:{
    width: 40,
    height: 20,
    marginLeft:5,
    border: 'solid',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#252525",
  },
  buttonText:{
    color: "white",
  },
  flatList:{
    minWidth: '100%',
    flex:1,
  },
});

export default HomePage;