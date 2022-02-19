import React , { useEffect, useState } from 'react';
import {StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity,Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const image = require('./spacebook.jpg');



function HomePage({route, navigation}) {
  const [token,setToken] = useState("");
  const [ID,setID] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [newPostData, setNewPostData] = useState("");
  const [dataArray,setDataArray]=useState([]);
  const [photo,setPhoto]=useState(null);

  const [refresh, setRefresh] = useState(true);
  const [loaded, setLoaded] = useState(1);
  const UserID = route.params.userID;
  const [input1, setInput1] = useState("");


  useEffect(()=>{
    AsyncStorage.getItem('id').then((value)=>setID(value));
    AsyncStorage.getItem('token').then((value)=>setToken(value));
  },[]);

  useEffect(() => { 
    if(token != ""){
      getPostData();
      getUserData();
      const Subscription = navigation.addListener('focus', () => {
        getPostData()
      });
      return Subscription;
    }
 },[token]);





  if(loaded ==3){
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Image source={photo} style={styles.image}></Image>
          <Text style={styles.titleText}>{firstName} {secondName}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} ref = {ref => {setInput1(ref);}} multiline placeholder="Post" onChangeText={(value) => setNewPostData(value)}/>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => {sendNewPostData();}}>
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
                {getButtons(item)}
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
          <Image source={photo} style={styles.image}></Image>
          <Text style={styles.titleText}>{firstName} {secondName}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} ref = {ref => {setInput1(ref);}} multiline placeholder="Post" onChangeText={(value) => setNewPostData(value)}/>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => {sendNewPostData();}}>
            <Text style={styles.buttonText}>Submit Post</Text> 
          </TouchableOpacity>
        </View>
        <View style={styles.innerContainer}>
          <Text style={{fontSize:10}}>No Posts Yet!</Text>
        </View>
      </View>
    )
  }
  else if(loaded == 4){
    return(
        <View style={styles.outerContainer}>
          <View style={styles.Title}>
            <Text style={styles.titleText}>{firstName} {secondName}</Text>
          </View>
          <View style={styles.innerContainer}>
            <View><Text>You are not friends with {firstName} {secondName}</Text></View>
            <View>
              <TouchableOpacity style={styles.touchableOpacity} onPress={() => {addFriend()}}>
                <Text style={styles.buttonText}>Click Here</Text>
              </TouchableOpacity>
            </View>
            <Text> To add them</Text>
          </View>
        </View>
      )
  }
  else{
    return(
      <View><Text>Loading</Text></View>
    )
  }


  function getButtons(item){
    if(item.userID == ID){
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

  function editPost(postID){
    console.log(UserID);
    navigation.navigate('Post', {postID,UserID});
  }

  async function likePost(postID){
    const response = await fetch("http://localhost:3333/api/1.0.0/user/"+UserID+"/post/"+postID+"/like",{
      method: 'POST',
      headers: {
        'X-Authorization': token
      },
    });
    if(response.status==200){
      getPostData();
    }
  }

  async function getUserData(){
    const response = await fetch("http://localhost:3333/api/1.0.0/user/"+UserID,{
      method: 'GET',
      headers: {
        'X-Authorization': token
      },
    });
    if(response.status==200){
        
      const body = await response.json();
      console.log(body);
      setFirstName(body.first_name);
      setSecondName(body.last_name);
      
    }
    else{
      setFirstName("Error");
      setSecondName("Error");
    }
    const imageResponse = await fetch("http://localhost:3333/api/1.0.0/user/"+UserID+"/photo",{
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





  async function addFriend(){
    const response = await fetch("http://localhost:3333/api/1.0.0/user/"+UserID+"/friends",{
      method: 'POST',
      headers: {
        'X-Authorization': token
      },
    });
    if(response.status==200){ 
        navigation.navigate('User', {UserID});
    }
  }





  async function getPostData(){
    const response = await fetch("http://localhost:3333/api/1.0.0/user/"+UserID+"/post",{
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
    else if(response.status == 403){
        setLoaded(4);
    }
    else{
        setLoaded(1); 
    }
    setRefresh(!refresh);
  }



  async function sendNewPostData(){
    const response = await fetch("http://localhost:3333/api/1.0.0/user/"+UserID+"/post",{
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Authorization': token,
      },
      body: JSON.stringify({
        text: newPostData,
      })
    });
    if(response.status == 201){
      input1.clear();
      getPostData();
    } 
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
    flex: 3,
    width:'100%',
  },
  input:{
    height:80,
    alignItems:'center',
    border: 'solid',
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: 'white',
    textAlign: 'center',
    width:'100%',
  },
  innerContainer:{
    alignItems: 'center',
    justifyContent: 'center',
    flex:15,
    minWidth: '100%',
    marginTop:10,
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
    paddingTop:5,
    flexDirection: 'row',
    flex:3,
    alignItems:'center',
    marginBottom: 10,
  },
  titleText:{
    fontSize:40, 
    color: '#252525',
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
  image:{
    width: 100,
    height: 100,
    border: 'solid',
    borderRadius:10,
    borderWidth: 3,
  },
});

export default HomePage;