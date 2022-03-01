import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function Post ({ route, navigation }) {
  const [token, setToken] = useState('')
  const [loaded, setLoaded] = useState(1)
  const [newPostData, setNewPostData] = useState('')
  const [dataArray, setDataArray] = useState([])
  const postID = route.params.postID
  const userID = route.params.UserID

  useEffect(() => {
    if (token !== '') {
      getPostData()
    }
    else{
      AsyncStorage.getItem('token').then((value) => setToken(value))
    }
  }, [token])

  if (loaded === 3) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.outerContainer}>
          <View style={styles.detailsTitleView}>
            <Text style={styles.detailsTitle}>Details:</Text>
          </View>
          <View style={styles.innerContainer}>
            <View style={styles.detailsContainer}>
              <View style={styles.detailsView}><Text style={styles.detailsField}>First Name: </Text><Text style={styles.detailsText}>{dataArray.fName}</Text></View>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Second Name: </Text><Text style={styles.detailsText}>{dataArray.sName}</Text></View>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Email: </Text><Text style={styles.detailsText}>{dataArray.userEmail}</Text></View>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Time: </Text><Text style={styles.detailsText}>{dataArray.time}</Text></View>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Likes: </Text><Text style={styles.detailsText}>{dataArray.likes}</Text></View>
            </View>
          </View>
          <View style={styles.detailsTitleView}>
            <Text style={styles.detailsTitle}>Content:</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { updatePost() }}>
              <Text style={styles.buttonText}>Update Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { deletePost() }}>
              <Text style={styles.buttonText}>Delete Post</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} multiline defaultValue={dataArray.text} onChangeText={(value) => setNewPostData(value)} />
          </View>
        </View>
      </ScrollView>
    )
  } else {
    return (
      <View><Text>Loading</Text></View>
    )
  }

  async function getPostData () {
    const token = await AsyncStorage.getItem('token')
    const id = await AsyncStorage.getItem('id')
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + userID + '/post/' + postID, {
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) {
      const body = await response.json()
      setDataArray([])
      const key = body.post_id
      const text = body.text
      var time = new Date(body.timestamp)
      time = time.toLocaleString();
      const likes = body.numLikes
      const fName = body.author.first_name
      const sName = body.author.last_name
      const userEmail = body.author.email
      const userID = body.author.user_id
      setDataArray({ key, text, time, likes, fName, sName, userEmail, userID })
      setLoaded(3)
    } else {
      setLoaded(1)
    }
  }

  async function updatePost () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + userID + '/post/' + postID, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        'X-Authorization': token
      },
      body: JSON.stringify({
        text: newPostData,
      })
    })
  }

  async function deletePost () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + userID + '/post/' + postID, {
      method: 'DELETE',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) {
      navigation.goBack()
    }
  }
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'white',
    marginLeft: 3,
    marginRight: 3
  },
  inputContainer: {
    alignItems: 'center',
    flex: 12,
    minWidth: '100%'
  },
  input: {
    borderWidth: 3,
    borderRadius: 10,
    minWidth: '100%',
    flex: 1,
    marginBottom: 10,
    padding: 5
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 6,
    minWidth: '100%'
  },
  touchableOpacity: {
    width: 130,
    height: 20,
    margin: 5,
    border: 'solid',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252525'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  buttonText: {
    color: 'white'
  },
  detailsText: {
    fontSize: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  detailsField: {
    fontWeight: 'bold',
    fontSize: 20,
    paddingTop: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  detailsTitle: {
    fontWeight: 'bold',
    fontSize: 30,
    minHeight:20,
  },
  detailsTitleView:{
    flex:1,
  },
  detailsView: {
    flex: 1,
    flexDirection: 'row'
  },
  detailsContainer: {
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 3,
    padding: 5,
    minWidth: '100%'
  },
})

export default Post
