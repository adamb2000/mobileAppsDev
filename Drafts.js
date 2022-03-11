import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function Drafts ({ route, navigation }) {
  const [token, setToken] = useState('')
  const [ID, setID] = useState('')

  const firstName = route.params.firstName // takes in the name of the users page its come from and whatever was in the input box so you can carry over whatever you were typing into a draft
  const secondName = route.params.secondName
  const UserID = route.params.UserID

  const [newPostData, setNewPostData] = useState(route.params.newPostData)
  const [dataArray, setDataArray] = useState([])
  const [refresh, setRefresh] = useState(true)
  const [loaded, setLoaded] = useState(1)
  const [input1, setInput1] = useState('')
  const [placeholder, setPlaceholder] = useState('Post')
  // Drafts are saved in the format of ID and UserID (ID being the logged in user and UserID being the id of the current users page thats being written on)
  // these IDs are put together meaning anyone can save drafts seperately on any users page and they will be accessable even if the app is restarted

  useEffect(() => {
    if (token !== '') {
      getDraftData()
      const Subscription = navigation.addListener('focus', () => { // subscription used to refresh page when user navigates back here
        getDraftData()
      })
      return Subscription
    } else {
      AsyncStorage.getItem('id').then((value) => setID(value)) // usestate that only runs code when Token and ID have been retrieved from storage
      AsyncStorage.getItem('token').then((value) => setToken(value))
    }
  }, [token])

  if (loaded === 3) {
    return (
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <View style={styles.titleTextView}>
            <Text style={styles.titleText}>Saved Drafts for </Text>
            <Text style={styles.titleText}>{firstName} {secondName}s page </Text>
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
                  <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => { postDraft(item.draftID, item.text, item.scheduled) }}>
                    <Text style={styles.buttonText}>Post Draft</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.listTouchableOpacity} onPress={() => { navigation.navigate('EditDrafts', { ID: ID, UserID: UserID, draftID: item.draftID }) }}>
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
            <Text style={styles.titleText}>{firstName} {secondName}s page </Text>
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

  async function getDraftData () {
    const data = await AsyncStorage.getItem(ID + '_' + UserID + '_' + 'drafts') // gets draft data from async storage
    if (data) {
      const object = await JSON.parse(data)
      if (object.length > 0) { // if the array is bigger than 1, put into data array to be displayed in the flatlist
        setDataArray(JSON.parse(data))
        setLoaded(3)
      } else {
        setLoaded(2) // if there is no storage with this ID or its an empty array, show the render with no flat list
      }
    } else {
      setLoaded(2)
    }
  }

  async function newDraft () {
    if (newPostData !== '') { // checks to make sure there is something in the input box as dont want empty drafts
      const time = (new Date()).toISOString() // gets the time to make a timestamp
      const oldData = await AsyncStorage.getItem(ID + '_' + UserID + '_' + 'drafts')
      if (oldData) { // gets data from storage and checks if anything is there, if not a new storage will be made for these drafts
        const object = await JSON.parse(oldData) // turn the string in storage into JSON object
        if (object.length > 0) { // if storage is there but no drafts are in it, make a new storage instead
          const newID = (object[object.length - 1].draftID) + 1 // create an object with ID 1 bigger than the current biggest ID to avoid duplicate IDs
          object.push({ draftID: newID, text: newPostData, timeStamp: time, scheduled: 'False', scheduleTime: '' }) // push the newly created object into the object array and save the whole thing back into storage under the same async storage ID
          await AsyncStorage.setItem(ID + '_' + UserID + '_' + 'drafts', JSON.stringify(object))
          setDataArray(object) // update the data array and refresh the flatlist
          setRefresh(!refresh)
        } else {
          newDraftStorage()
        }
      } else {
        newDraftStorage()
      }
      async function newDraftStorage () {
        const objectArray = [{ draftID: 1, text: newPostData, timeStamp: time, scheduled: 'False', scheduleTime: '' }] // create a new object array with ID starting at 1 and save to storage
        await AsyncStorage.setItem(ID + '_' + UserID + '_' + 'drafts', JSON.stringify(objectArray))
        setDataArray(objectArray) // update the data array and refresh the flatlist
        setRefresh(!refresh)
        setLoaded(3)
      }
      input1.clear() // clear the input and reset placeholder when successful
      setPlaceholder('Post')
      setNewPostData('')
    } else {
      setPlaceholder('Cannot submit empty draft') // warning when user tries to submit empty draft
    }
  }

  async function postDraft (key, text, scheduled) {
    setPlaceholder('Post') // reset the placeholder
    const response = await fetch('http://localhost:3333/api/1.0.0/user/' + UserID + '/post', { // POST /user/{user_id}/post Endpoint
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
      deleteDraft(key, scheduled) // if successful delete the draft from storage
    } else if (response.status === 401) {
      navigation.navigate('HomePage') // if these is an error, revert back to homepage to avoid messing up async storage
    }
  }

  async function deleteDraft (key, scheduled) {
    if (scheduled === 'True') { // Needs to check if the draft is scheduled before removing post as the schedule will also need to be canceled
      const ScheduleID = ID + '_' + UserID + '_' + key
      const temp = global.activeDrafts
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].id === ScheduleID) {
          const tempJob = temp[i].schJob
          tempJob.cancel()
          temp.splice(i, 1) // if draft has been scheduled, cancel the jon and remove all instances of schedule
        }
      }
      global.activeDrafts = temp // uses global variable to store the schedule jobs so they can be accessed in any page
      const bodyStr = await AsyncStorage.getItem('scheduledPosts')
      const body = await JSON.parse(bodyStr)
      if (body.length > 1) { // removing schedule instance from permanent Async Storage
        const removed = body.filter(item => item.scheduleID !== ScheduleID) // filters out the draft data for the draft that is being deleted
        AsyncStorage.setItem('scheduledPosts', JSON.stringify(removed))
      } else {
        AsyncStorage.removeItem('scheduledPosts') // if this is the last item in sotrage, just remove the whole storage
      }
    }
    const oldData = await AsyncStorage.getItem(ID + '_' + UserID + '_' + 'drafts')
    const object = await JSON.parse(oldData)
    const result = object.filter(item => item.draftID !== key) // get drafts out of storage and filter out the draft with 'key' draft ID
    await AsyncStorage.setItem(ID + '_' + UserID + '_' + 'drafts', JSON.stringify(result)) // save the new array back into storage, object has to be in string format to be saved into async storage
    getDraftData()
  }

  function getDate (timestamp) {
    const time = new Date(timestamp) // changes the time to a user friendly format
    return time.toLocaleString()
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
