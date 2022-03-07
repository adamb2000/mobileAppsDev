import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function Friends ({ navigation }) {
  const [token, setToken] = useState('')
  const [search, setSearch] = useState('')
  const [loaded, setLoaded] = useState(1)
  const [dataArray, setDataArray] = useState([])
  const [refresh, setRefresh] = useState(true)
  const [requests, setRequests] = useState(0)

  useEffect(() => {
    if (token !== '') {
      getRequests()
      getFriends()
      const Subscription = navigation.addListener('focus', () => {
        getRequests()
        getFriends()
      })
      return Subscription
    } else {
      AsyncStorage.getItem('token').then((value) => setToken(value))
    }
  }, [token])

  if (loaded === 3) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={{ fontSize: 50 }}>Friends</Text>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => { navigation.navigate('Requests') }}>
            <Text style={styles.buttonText}>Requests: {requests}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder='Search' onChangeText={(value) => setSearch(value)} />
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => { getFriends() }}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.innerContainer}>
          <FlatList
            style={styles.flatList}
            data={dataArray} extraData={refresh}
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
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => { navigation.navigate('Requests') }}>
            <Text style={styles.buttonText}>Requests: {requests}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder='Search' onChangeText={(value) => setSearch(value)} />
        </View>
        <TouchableOpacity style={styles.touchableOpacity} onPress={() => { getFriends() }}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
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

  async function getRequests () {
    const response = await fetch('http://localhost:3333/api/1.0.0/friendrequests', {
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) {
      const body = await response.json()
      setRequests(body.length)
    }
  }

  function navigateUser (userID) {
    navigation.navigate('User', { userID })
  }

  async function getFriends () {
    const response = await fetch('http://localhost:3333/api/1.0.0/search?search_in=friends&limit=20&offset=0&q=' + search, {
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) {
      const body = await response.json()
      if (body.length > 0) {
        setDataArray([])
        for (let i = 0; i < body.length; i++) {
          const key = body[i].user_id
          const fName = body[i].user_givenname
          const sName = body[i].user_familyname
          const email = body[i].user_email
          setDataArray(old => [...old, { key, fName, sName, email }])
        }
        setLoaded(3)
        setRefresh(!refresh)
      } else {
        setLoaded(2)
      }
    } else {
      setLoaded(1)
    }
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
    paddingTop: 10,
    alignItems: 'center',
    minHeight: 100
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
    flex: 1,
    minHeight: 100
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

export default Friends
