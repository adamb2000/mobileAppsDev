import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function Drafts ({ route, navigation }) {
  const [token, setToken] = useState('')
  const [ID, setID] = useState('')

  const firstName = route.params.firstName
  const secondName = route.params.secondName
  const UserID = route.params.UserID

  const [newPostData, setNewPostData] = useState(route.params.newPostData)
  const [dataArray, setDataArray] = useState([])
  const [refresh, setRefresh] = useState(true)
  const [loaded, setLoaded] = useState(1)
  const [input1, setInput1] = useState('')
  const [placeholder, setPlaceholder] = useState('Post')
  //AsyncStorage.clear()

  useEffect(() => {
    if (token !== '') {
      getDraftData()
      const Subscription = navigation.addListener('focus', () => {
        getDraftData()
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
          <View style={styles.titleTextView}>
            <Text style={styles.titleText}>Saved Drafts for </Text>
            <Text style={styles.titleText}>{firstName} {secondName}'s page </Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} ref={ref => { setInput1(ref) }} multiline placeholder={placeholder} defaultValue={newPostData} onChangeText={(value) => setNewPostData(value)} />
          <View style={styles.buttonView}>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { newDraft() }}>
              <Text style={styles.buttonText}>Save New Draft</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.innerContainer}>
          <FlatList
            style={styles.flatList}
            data={dataArray} extraData={refresh} keyExtractor={(item) => item.draftID}
            renderItem={({ item }) =>
              <View style={styles.listView}>
                <Text style={styles.listTextName}>{getDate(item.timeStamp)}</Text>
                <Text style={styles.listText}>{item.text}</Text>
                <View style={styles.listButtonView}>
                  <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => { postDraft(item.draftID, item.text) }}>
                    <Text style={styles.buttonText}>Post Draft</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => { deleteDraft(item.draftID) }}>
                    <Text style={styles.buttonText}>Delete Draft</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => { navigation.navigate('EditDrafts',{ID:ID,UserID:UserID,draftID:item.draftID}) }}>
                    <Text style={styles.buttonText}>Edit Draft</Text>
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
          <View style={styles.titleTextView}>
            <Text style={styles.titleText}>Saved Drafts for </Text>
            <Text style={styles.titleText}>{firstName} {secondName}'s page </Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} ref={ref => { setInput1(ref) }} multiline placeholder={placeholder} defaultValue={newPostData} onChangeText={(value) => setNewPostData(value)} />
          <View style={styles.buttonView}>
            <TouchableOpacity style={styles.touchableOpacity} onPress={() => { newDraft() }}>
              <Text style={styles.buttonText}>Save New Draft</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.innerContainer}>
          <Text style={{ fontSize: 10 }}>No Drafts Yet!</Text>
        </View>
      </View>
    )
  } else {
    return (
      <View><Text>Loading</Text></View>
    )
  }


  function getDate(timestamp){
    let time = new Date(timestamp)
    return time.toLocaleString()
  }
  

  async function getDraftData () {
    const data = await AsyncStorage.getItem(ID + '_' + UserID + '_' + 'drafts')
    if (data) {
      const object = await JSON.parse(data)
      if (object.length > 0) {
        setDataArray(JSON.parse(data))
        setLoaded(3)
      } else {
        setLoaded(2)
      }
    } else {
      setLoaded(2)
    }
  }

  async function newDraft () {
    if (newPostData !== '') {
      const time = (new Date).toISOString()
      const oldData = await AsyncStorage.getItem(ID + '_' + UserID + '_' + 'drafts')
      if (oldData) {
        const object = await JSON.parse(oldData)
        if (object.length > 0) {
          const newID = (object[object.length - 1].draftID) + 1
          object.push({ draftID: newID, text: newPostData, timeStamp:time,scheduled:'False',scheduleTime:null })
          await AsyncStorage.setItem(ID + '_' + UserID + '_' + 'drafts', JSON.stringify(object))
          setDataArray(object)
          setRefresh(!refresh)
        } else {
          newDraftStorage()
        }
      } else {
        newDraftStorage()
      }
      async function newDraftStorage () {
        const objectArray = [{ draftID: 1, text: newPostData,timeStamp:time,scheduled:'False',scheduleTime:null }]
        await AsyncStorage.setItem(ID + '_' + UserID + '_' + 'drafts', JSON.stringify(objectArray))
        setDataArray(objectArray)
        setRefresh(!refresh)
        setLoaded(3)
      }
      input1.clear()
      setPlaceholder('Post')
      setNewPostData('')
    } else {
      setPlaceholder('Cannot submit empty draft')
    }
  }

  async function postDraft (key, text) {
    setPlaceholder('Post')
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + UserID + '/post', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Authorization': token
      },
      body: JSON.stringify({
        text: text
      })
    })
    if (response.status === 201) {
      deleteDraft(key)
    } else if (response.status === 401) {
      navigation.navigate('HomePage')
    }
  }

  async function deleteDraft (key) {
    const oldData = await AsyncStorage.getItem(ID + '_' + UserID + '_' + 'drafts')
    const object = await JSON.parse(oldData)
    const result = object.filter(item => item.draftID !== key)
    await AsyncStorage.setItem(ID + '_' + UserID + '_' + 'drafts', JSON.stringify(result))
    getDraftData()
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
  listText: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  listTextName: {
    fontSize: 10
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
    width: 130,
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
    width: 90,
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
    flexDirection: 'row'
  },
  image: {
    width: 100,
    height: 100,
    border: 'solid',
    borderRadius: 10,
    borderWidth: 3
  }
})

export default Drafts
