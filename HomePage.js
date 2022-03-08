import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function HomePage ({ navigation }) {
  const [token, setToken] = useState('')
  const [ID, setID] = useState('')
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [newPostData, setNewPostData] = useState('')
  const [dataArray, setDataArray] = useState([])
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')
  const [refresh, setRefresh] = useState(true)
  const [loaded, setLoaded] = useState(1)
  const [input1, setInput1] = useState('')
  const [placeholder, setPlaceholder] = useState('Post')

  useEffect(() => { // Usestate used to only run code once token has been retireved from async storage
    if (token !== '') {
      getUserData()
      const Subscription = navigation.addListener('focus', () => { // subscription used to refresh page when user navigates back here
        getUserData()
      })
      return Subscription
    } else {
      AsyncStorage.getItem('id').then((value) => setID(value))
      AsyncStorage.getItem('token').then((value) => setToken(value))
    }
  }, [token])

  if (loaded === 3) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Image source={photo} style={styles.image} />
          <View style={styles.titleTextView}>
            <Text style={styles.titleText}>{firstName} {secondName}</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} ref={ref => { setInput1(ref) }} multiline placeholder={placeholder} onChangeText={(value) => setNewPostData(value)} />
          <View style={styles.buttonView}>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { sendNewPostData() }}>
              <Text style={styles.buttonText}>Submit Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { navigateDraft(ID) }}>
              <Text style={styles.buttonText}>Drafts</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.innerContainer}>
          <FlatList
            style={styles.flatList}
            data={dataArray} extraData={refresh}
            renderItem={({ item }) =>
              <View style={styles.listView}>
                <Text style={styles.listTextName}>{item.fName} {item.sName} at {item.time}</Text>
                <Text style={styles.listText}>{item.text}</Text>
                <View style={styles.listButtonView}>
                  <Text>Likes: {item.likes}</Text>
                  {getButtons(item)}
                </View>
              </View>}
          />
        </View>
      </View>
    )
  } else if (loaded === 2) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Image source={photo} style={styles.image} />
          <View style={styles.titleTextView}>
            <Text style={styles.titleText}>{firstName} {secondName}</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} ref={ref => { setInput1(ref) }} mulitline placeholder={placeholder} onChangeText={(value) => setNewPostData(value)} />
          <View style={styles.buttonView}>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { sendNewPostData() }}>
              <Text style={styles.buttonText}>Submit Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { navigateDraft(ID) }}>
              <Text style={styles.buttonText}>Drafts</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.innerContainer}>
          <Text style={{ fontSize: 10 }}>No Posts Yet!</Text>
        </View>
      </View>
    )
  } else {
    return (
      <View>
        <View><Text>Loading</Text></View>
        <View><Text>{error}</Text></View>
      </View>
    )
  }

  async function getUserData () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + ID, { // GET /user/{user_id} Endpoint
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) { // Error handling
      const body = await response.json() // converts the HTML response to JSON and then sets name states
      setFirstName(body.first_name)
      setSecondName(body.last_name)
    } else if (response.status === 401) {
      AsyncStorage.removeItem('token')
      AsyncStorage.removeItem('id') // Will log user out if a valid token is not present
      navigation.navigate('Login')
    } else if (response.status === 404) {
      setLoaded(1)
      setError('Error - User Not Found') // uses 'Error' state to display error message on screen to user
    } else if (response.status === 500) {
      setLoaded(1)
      setError('Server Error')
    }
    const imageResponse = await fetch('http://localhost:3333/api/1.0.0/user/' + ID + '/photo', { // GET /user/{user_id}/photo Endpoint
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (imageResponse.status === 200) {
      const body = await imageResponse.blob() // converts image to blob and sets phoot state to link for the blob
      setPhoto(URL.createObjectURL(body))
    }
    getPostData()
  }

  async function getPostData () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + ID + '/post', { // GET /user/{user_id}/post
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) { // Error handling, will only show flatlist render if valid data is returned from server
      const body = await response.json()
      if (body.length > 0) {
        setDataArray([])
        for (let i = 0; i < body.length; i++) {
          const key = body[i].post_id
          const text = body[i].text
          let time = new Date(body[i].timestamp)
          time = time.toLocaleString() // date formatted in user readable format
          const likes = body[i].numLikes // all data for a post is turned into an object and put into dataArray
          const fName = body[i].author.first_name
          const sName = body[i].author.last_name
          const userID = body[i].author.user_id
          setDataArray(old => [...old, { key, text, time, likes, fName, sName, userID }])
        }
        setLoaded(3)
      } else {
        setLoaded(2) // if response is valid but no posts are present, show second render
      }
    } else if (response.status === 401) { // log user out if a valid toke is not present
      AsyncStorage.removeItem('token')
      AsyncStorage.removeItem('id')
      navigation.navigate('Login')
    } else if (response.status === 500) {
      setLoaded(1)
      setError('Server Error ') // show error messages if errors occur
    }
    setRefresh(!refresh) // variable in flatlist that allows the list to refresh when this state is changed
  }

  async function sendNewPostData () {
    if (newPostData !== '') { // cannnot submit an empty post
      const response = await fetch('http://localhost:3333/api/1.0.0/user/' + ID + '/post', { // POST /user/{user_id}/post Endpoint
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-Authorization': token
        },
        body: JSON.stringify({
          text: newPostData // stringifys the new data to send to server in request body
        })
      })
      if (response.status === 201) {
        setPlaceholder('Post') // retuinrs plceholder to 'post' if the new post was successfullly submitted as it couldve been changed in the error handling
        input1.clear()
        setNewPostData('') // clear the input and the state containing the inputs value
        getPostData() // get the post data again containing the newly submitted post
      } else if (response.status === 500) {
        setPlaceholder('Server Error') // show error messages if the request was not successful
      }
    } else {
      setPlaceholder('Cannot Submit Empty Post')
    }
  }

  function navigateDraft (UserID) {
    navigation.navigate('Drafts', { firstName, secondName, UserID, newPostData }) // navigate to draft page with all into needed
  }

  function getButtons (item) {
    if (item.userID === parseInt(ID)) { // returns the like button if it is not your own post
      return (
        <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => { editPost(item.key) }}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      )
    }
  }

  function editPost (postID) {
    const UserID = ID
    navigation.navigate('Post', { postID, UserID }) // navigate to editpost page with details for this specific post
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
    justifyContent: 'center',
    flex: 3,
    width: '100%'
  },
  input: {
    height: 80,
    alignItems: 'center',
    border: 'solid',
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: 'white',
    textAlign: 'center',
    width: '100%'
  },
  innerContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 15,
    minWidth: '100%'
  },
  listView: {
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 3,
    padding: 5,
    minWidth: '100%'
  },
  listTextName: {
    fontSize: 10
  },
  listText: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  listButtonView: {
    alignItems: 'center',
    marginTop: 5,
    flex: 1,
    flexDirection: 'row'
  },
  Title: {
    paddingTop: 5,
    flexDirection: 'row',
    flex: 3,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100
  },
  titleText: {
    fontSize: 40,
    color: '#252525',
    alignContent: 'center',
    justifyContent: 'center'
  },
  touchableOpacity: {
    width: 130,
    height: 20,
    marginTop: 5,
    border: 'solid',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252525'
  },
  listTouchableOpacity: {
    width: 40,
    height: 20,
    marginLeft: 5,
    border: 'solid',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252525'
  },
  buttonText: {
    color: 'white'
  },
  buttonView: {
    flex: 2,
    flexDirection: 'row',
    minHeight: 30
  },
  flatList: {
    minWidth: '100%',
    flex: 1
  },
  titleTextView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    width: 100,
    height: 100,
    border: 'solid',
    borderRadius: 10,
    borderWidth: 3
  }
})

export default HomePage
