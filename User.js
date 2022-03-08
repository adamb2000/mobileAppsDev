import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function HomePage ({ route, navigation }) {
  const [token, setToken] = useState('')
  const [ID, setID] = useState('')
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [newPostData, setNewPostData] = useState('')
  const [dataArray, setDataArray] = useState([])
  const [photo, setPhoto] = useState(null)

  const [refresh, setRefresh] = useState(true)
  const [loaded, setLoaded] = useState(1)
  const [UserID, setUserID] = useState(route.params.userID)
  const [input1, setInput1] = useState('')
  const [status, setStatus] = useState(0)
  const [error, setError] = useState('')
  const [placeholder, setPlaceholder] = useState('Post')

  useEffect(() => {
    if (token !== '') {
      getPostData()
      getUserData() // Usestate used to only run code once token has been retireved from async storage
      const Subscription = navigation.addListener('focus', () => { // subscription used to refresh page when user navigates back here
        getUserData()
        getPostData()
      })
      return Subscription
    } else {
      AsyncStorage.getItem('id').then((value) => setID(value))
      AsyncStorage.getItem('token').then((value) => setToken(value))
    }
  }, [token, UserID])

  useEffect(() => {
    if (route.params.newUserID) {
      setUserID(route.params.newUserID) // sets the userID again when page is revisited, looking at a new user
      setLoaded(1) // renders the loadning page when switching whihc user is being viewed
    }
  }, [route.params.newUserID])

  useEffect(() => {
    if (loaded === 1 && token !== '') {
      getPostData()
      getUserData() // reloads the data when loaded variable changes
    }
  }, [loaded])

  if (loaded === 3) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Image source={photo} style={styles.image} />
          <View style={styles.titleTextView}>
            <Text style={styles.titleText}>{firstName} {secondName} </Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} ref={ref => { setInput1(ref) }} multiline placeholder={placeholder} onChangeText={(value) => setNewPostData(value)} />
          <View style={styles.buttonView}>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { sendNewPostData() }}>
              <Text style={styles.buttonText}>Submit Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { navigation.navigate('ViewFriends', { UserID }) }}>
              <Text style={styles.buttonText}>View Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { navigation.navigate('Drafts', { firstName, secondName, UserID, newPostData }) }}>
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
                  {getButtons(item) /* buttons are different depening on who the particular post was made by */}
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
          <TextInput style={styles.input} ref={ref => { setInput1(ref) }} multiline placeholder={placeholder} onChangeText={(value) => setNewPostData(value)} />
          <View style={styles.buttonView}>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { sendNewPostData() }}>
              <Text style={styles.buttonText}>Submit Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { navigation.navigate('ViewFriends', { UserID }) }}>
              <Text style={styles.buttonText}>View Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { navigation.navigate('Drafts', { firstName, secondName, UserID, newPostData }) }}>
              <Text style={styles.buttonText}>Drafts</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.innerContainer}>
          <Text style={{ fontSize: 10 }}>No Posts Yet!</Text>
        </View>
      </View>
    )
  } else if (loaded === 4) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={styles.titleText}>{firstName} {secondName}</Text>
        </View>
        <View style={styles.innerContainer}>
          <View><Text>You are not friends with {firstName} {secondName}</Text></View>
          <View>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { addFriend() }}>
              <Text style={styles.buttonText}>Click Here</Text>
            </TouchableOpacity>
          </View>
          <Text> To add them</Text>
          {warning()}
        </View>
      </View>
    )
  } else {
    return (
      <View>
        <View><Text>Loading</Text></View>
        <View><Text>{error /* error message displayed to user */}</Text></View>
      </View>
    )
  }

  function getButtons (item) {
    if (item.userID === parseInt(ID)) { // returns the buttons for each post (can only edit your own posts and can only like other users posts)
      return (
        <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => { editPost(item.key) }}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      )
    } else {
      return (
        <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => { likePost(item.key) }}>
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>
      )
    }
  }

  async function likePost (postID) {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + UserID + '/post/' + postID + '/like', { // POST /user/{user_id}/post/{post_id}/like Endpoint
      method: 'POST',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) { // Error Handling, if post is already liked (400) it will dislike the post
      getPostData()
    } else if (response.status === 400) {
      dislikePost(postID)
    } else {
      console.log('Server Error')
    }
  }

  async function dislikePost (postID) {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + UserID + '/post/' + postID + '/like', { // DELETE /user/{user_id}/post/{post_id}/like Endpoint
      method: 'DELETE',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) { // Error Handling, if post is not already liked (400) it will like the post
      getPostData()
    } else if (response.status === 400) {
      likePost(postID)
    } else {
      console.log('Server Error')
    }
  }

  async function getUserData () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + UserID, { // GET /user/{user_id} Endpoint
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) { // Error handling
      const body = await response.json() // converts the HTML response to JSON and then sets name states
      setFirstName(body.first_name)
      setSecondName(body.last_name)
    } else if (response.status === 401) { // Will log user out if a valid token is not present
      AsyncStorage.removeItem('token')
      AsyncStorage.removeItem('id')
      navigation.navigate('Login')
    } else if (response.status === 404) {
      setLoaded(1)
      setError('Error - User Not Found') // uses 'Error' state to display error message on screen to user
    } else if (response.status === 500) {
      setLoaded(1)
      setError('Server Error')
    }
    const imageResponse = await fetch('http://localhost:3333/api/1.0.0/user/' + UserID + '/photo', { // GET /user/{user_id}/photo Endpoint
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (imageResponse.status === 200) {
      const body = await imageResponse.blob() // converts image to blob and sets phoot state to link for the blob
      setPhoto(URL.createObjectURL(body))
    }
  }

  async function addFriend () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + UserID + '/friends', { // POST /user/{user_id}/friends Endpoint
      method: 'POST',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 201) {
      setStatus(1) // status state used to display message to user, message made from 'Warning()' function
    } else if (response.status === 403) {
      setStatus(2)
    } else if (response.status === 404 || response.status === 500) {
      setStatus(3)
    }
  }

  async function getPostData () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + UserID + '/post', { // GET /user/{user_id}/post Endpoint
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
    } else if (response.status === 403) { // show fourth render if requested user isnt currently a friend
      setLoaded(4)
    } else if (response.status === 401) { // log user out if a valid toke is not present
      AsyncStorage.removeItem('token')
      AsyncStorage.removeItem('id')
      navigation.navigate('Login')
    } else if (response.status === 500) {
      setLoaded(1)
      setError('Server Error ') // show error messages if errors occur
    } else {
      setLoaded(1)
    }
    setRefresh(!refresh) // variable in flatlist that allows the list to refresh when this state is changed
  }

  async function sendNewPostData () {
    if (newPostData !== '') { // cannnot submit an empty post
      const response = await fetch('http://localhost:3333/api/1.0.0/user/' + UserID + '/post', { // POST /user/{user_id}/post Endpoint
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-Authorization': token
        },
        body: JSON.stringify({ // stringify the new post data in the body of the request
          text: newPostData
        })
      })
      if (response.status === 201) {
        input1.clear() // if request is successful, clear the input and get post data again to show the new post in the list
        setNewPostData('')
        setPlaceholder('Post')
        getPostData()
      }
    } else {
      setPlaceholder('Cannot Submit Empty Post') // error message is displayed if current typed post is empty
    }
  }

  function editPost (postID) {
    navigation.navigate('Post', { postID, UserID }) // navigate to edit post page, with the psotID and UserID of the specific post
  }

  function warning () { // function that returns warning text based on the current value in 'status'
    if (status === 1) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: '#252525' }}>Request Submitted!</Text>
        </View>
      )
    } else if (status === 2) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: '#252525' }}>Request Already Submitted!</Text>
        </View>
      )
    } else if (status === 3) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: '#252525' }}>Server Error, please try again</Text>
        </View>
      )
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
    width: '100%',
    flex: 4
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 15,
    minWidth: '100%',
    marginTop: 10
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
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 110
  },
  titleText: {
    fontSize: 40,
    color: '#252525',
    alignContent: 'center',
    justifyContent: 'center'
  },
  titleTextView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  touchableOpacity: {
    width: 120,
    height: 20,
    marginTop: 5,
    border: 'solid',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252525',
    marginLeft: 3
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
  flatList: {
    minWidth: '100%',
    flex: 1
  },
  buttonView: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 30
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
