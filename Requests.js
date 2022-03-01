import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function Requests ({ navigation }) {
  const [token, setToken] = useState('')
  const [loaded, setLoaded] = useState(1)
  const [refresh, setRefresh] = useState(true)
  const [dataArray, setDataArray] = useState([])
  const [status, setStatus] = useState(0)

  useEffect(() => {
    if (token !== '') {
      getRequests()
    }
    else{
      AsyncStorage.getItem('token').then((value) => setToken(value))
    }
  }, [token])

  if (loaded === 3) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Text style={{ fontSize: 30 }}>Friend Requests</Text>
        </View>
        {warning()}
        <View style={styles.innerContainer}>
          <FlatList
            style={styles.flatList}
            data={dataArray} extraData={refresh}
            renderItem={({ item }) =>
              <View style={styles.listView}>
                <Text style={styles.listTextName}>{item.fName} {item.sName}</Text>
                <Text style={styles.listText}>{item.email}</Text>
                <View style={styles.listButtonView}>
                  <TouchableOpacity style={styles.userTouchableOpacity} onPress={() => { acceptRequest(item.key) }}>
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.userTouchableOpacity} onPress={() => { declineRequest(item.key) }}>
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>
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
          <Text style={{ fontSize: 30 }}>Friend Requests</Text>
        </View>
        <View style={styles.innerContainer}>
          <Text>No Requests :(</Text>
        </View>
      </View>
    )
  } else {
    return (
      <View>
        <View><Text>Loading</Text></View>
        <View><Text>{warning}</Text></View>
      </View>
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
      if (body.length > 0) {
        for (let i = 0; i < body.length; i++) {
          const key = body[i].user_id
          const fName = body[i].first_name
          const sName = body[i].last_name
          const email = body[i].email
          setDataArray(old => [...old, { key, fName, sName, email }])
        }
        setLoaded(3)
        setRefresh(!refresh)
      } else {
        setLoaded(2)
      }
      setStatus(0)
    } else if(status === 401){
      AsyncStorage.removeItem('token')
      AsyncStorage.removeItem('id')
      navigation.navigate('Login')
    } else{
      setStatus(1)
    }
  }

  async function acceptRequest (key) {
    const response = await fetch('http://localhost:3333/api/1.0.0/friendrequests/' + key, {
      method: 'POST',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) {
      getRequests()
      setStatus(0)
    } else if(response.status === 401){
      AsyncStorage.removeItem('token')
      AsyncStorage.removeItem('id')
      navigation.navigate('Login')
    } else {
      setStatus(1)
    }
    
  }

  async function declineRequest (key) {
    const response = await fetch('http://localhost:3333/api/1.0.0/friendrequests/' + key, {
      method: 'DELETE',
      headers: {
        'X-Authorization': token
      }
    })
    if (response.status === 200) {
      getRequests()
      setStatus(0)
    } else if(response.status === 401){
      AsyncStorage.removeItem('token')
      AsyncStorage.removeItem('id')
      navigation.navigate('Login')
    } else {
      setStatus(1)
    }
    
  }



  function warning () {
    if (status === 1) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: 'green' }}>Server Error, please try again</Text>
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
    backgroundColor: 'white'
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 8,
    minWidth: '100%',
    marginTop: 10
  },
  Title: {
    flex: 1,
    paddingTop: 20
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
  userTouchableOpacity: {
    width: 60,
    height: 20,
    marginTop: 5,
    border: 'solid',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252525'
  },
  buttonText: {
    color: 'white'
  }
})

export default Requests
