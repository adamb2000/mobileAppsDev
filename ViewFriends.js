import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function Search ({ route, navigation }) {
  const [token, setToken] = useState('')
  const [loaded, setLoaded] = useState(1) // loaded initally set to 1 to show 'loading' page
  const [dataArray, setDataArray] = useState([])

  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const userID = route.params.UserID

  useEffect(() => {
    if (token !== '') {
      getFriends()
      getUserData() // Usestate used to only run code once token has been retireved from async storage
    } else {
      AsyncStorage.getItem('token').then((value) => setToken(value))
    }
  }, [token, route.params.UserID])

  if (loaded === 3) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={{ fontSize: 50 }}>{firstName} {secondName}</Text>
          <Text style={{ fontSize: 50 }}>Friends</Text>
        </View>
        <View style={styles.innerContainer}>
          <FlatList
            style={styles.flatList}
            data={dataArray}
            renderItem={({ item }) =>
              <View style={styles.listView}>
                <TouchableOpacity style={styles.userTouchableOpacity} onPress={() => { navigateUser(item.key) }}>
                  <Text style={styles.listTextName}>{item.fName} {item.sName}</Text>
                  <Text style={styles.listText}>{item.email}</Text>
                </TouchableOpacity>
              </View>}
          />
        </View>
      </View>
    )
  } else if (loaded === 2) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={{ fontSize: 50 }}>Friends</Text>
        </View>
        <View style={styles.innerContainer}>
          <Text>No Friends :(</Text>
        </View>
      </View>
    )
  } else {
    return (
      <View><Text>Loading</Text></View>
    )
  }

  async function getUserData () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + userID, { // GET /user/{user_id} Endpoint
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) { // Error handling, will set name to 'error' if it cannot get a good response from server
      const body = await response.json() // converts the HTML response to JSON and then sets name states
      setFirstName(body.first_name)
      setSecondName(body.last_name)
    } else {
      setFirstName('Error')
      setSecondName('Error')
    }
  }

  async function getFriends () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + userID + '/friends', { // GET /user/{user_id}/friends Endpoint
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) {
      const body = await response.json() // converts the HTML response to JSON to use in for loop
      if (body.length > 0) {
        setDataArray([])
        for (let i = 0; i < body.length; i++) {
          const key = body[i].user_id
          const fName = body[i].user_givenname // loop used store friend data in array from the HTML response
          const sName = body[i].user_familyname
          const email = body[i].user_email
          setDataArray(old => [...old, { key, fName, sName, email }])
        } // loaded state changed depending on if there any friends or if the server request failed
        setLoaded(3) // shows render with flat list
      } else {
        setLoaded(2) // shows render without flatlist
      }
    } else {
      setLoaded(1) // shows loading screen
    }
  }

  function navigateUser (newUserID) {
    navigation.navigate('User', { newUserID }) // function used to change variable name and naviagte to seperate page
  }
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'white'
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 10,
    minWidth: '100%'
  },
  Title: {
    flex: 2,
    paddingTop: 20,
    alignItems: 'center',
    minHeight: 150
  },
  flatList: {
    minWidth: '100%',
    flex: 1,
    padding: 5
  },
  listView: {
    borderWidth: 3,
    borderRadius: 10,
    marginBottom: 4,
    padding: 5,
    minWidth: '100%'
  },
  listTextName: {
    fontSize: 10
  },
  listText: {
    fontSize: 20
  },
  listButtonView: {
    alignItems: 'center',
    marginTop: 5,
    flex: 1,
    flexDirection: 'row'
  },
  inputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  input: {
    width: 300,
    height: 40,
    alignItems: 'center',
    border: 'solid',
    borderRadius: 100,
    marginBottom: 10,
    backgroundColor: 'white',
    textAlign: 'center'
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
  userTouchableOpacity: {
    flex: 1
  },
  buttonText: {
    color: 'white'
  }
})

export default Search
