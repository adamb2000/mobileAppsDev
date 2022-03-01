import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function Search ({ route, navigation }) {
  const [token, setToken] = useState('')
  const [loaded, setLoaded] = useState(1)
  const [dataArray, setDataArray] = useState([])

  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [User_ID,setUser_ID] = useState(route.params.UserID)

  useEffect(() => {
    if (token !== '') {
      getFriends()
      getUserData()
    }
    else{
      AsyncStorage.getItem('token').then((value) => setToken(value))
    }
  }, [token,route.params.UserID])

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


  function navigateUser (newUserID) {
    navigation.navigate('User',{newUserID} );
  }



  async function getUserData () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + User_ID, {
      method: 'GET',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) {
      const body = await response.json()
      setFirstName(body.first_name)
      setSecondName(body.last_name)
    } else {
      setFirstName('Error')
      setSecondName('Error')
    }
  }





  async function getFriends () {
    const response = await fetch('http://localhost:3333/api/1.0.0/user/'+User_ID+'/friends', {
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
    paddingTop: 20,
    alignItems: 'center',
    minHeight:150,
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
