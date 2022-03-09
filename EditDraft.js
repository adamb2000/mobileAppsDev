import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function EditDraft ({ route, navigation }) {
  const schedule = require('node-schedule')
  const [loaded, setLoaded] = useState(1)
  const [newPostData, setNewPostData] = useState('')
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState(0)
  const [dateTime, setDateTime] = useState('')
  const ID = route.params.ID
  const UserID = route.params.UserID
  const DraftID = route.params.draftID
  const dateTimeKey = /((([0][1-9])|([1-2]\d)|([3][0-1]))-(([0][1-9])|([1][1-2]))-\d{4} (([0-1]\d)|([2][0-3])):[0-5]\d:[0-5]\d)/

  // Drafts are saved in the format of ID and UserID (ID being the logged in user and UserID being the id of the current users page thats being written on)
  // these IDs are put together meaning anyone can save drafts seperately on any users page and they will be accessable even if the app is restarted
  useEffect(() => {
    if (post === null) {
      getDraftData()
    } else { // runs again when the post data has been loaded in and renders post instead of loading screen
      setNewPostData(post[0].text)
      setLoaded(3)
    }
  }, [post])

  if (loaded === 3) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.outerContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.detailsTitleView}>
              <Text style={styles.detailsTitle}>Details:</Text>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Last Updated: </Text><Text style={styles.detailsText}>{getDate(post[0].timeStamp)}</Text></View>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Post Scheduled: </Text><Text style={styles.detailsText}>{post[0].scheduled}</Text></View>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Schedule Time: </Text><Text style={styles.detailsText}>{getDate(post[0].scheduleTime)}</Text></View>
            </View>
            <View style={styles.detailsTitleView}>
              <Text style={styles.detailsTitle}>Schedule:</Text>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Schedule Time: (DD-MM-YYYY hh:mm:ss) </Text></View>
              <View style={styles.detailsView}><TextInput style={styles.dateInput} placeholder="DD-MM-YYYY hh:mm:ss" onChangeText={(value) => setDateTime(value)}/></View>
            </View>
          </View>
          <View style={styles.bottomContainer}>
            <View style={styles.detailsTitleViewWarning}>
              {warning()}
              <Text style={styles.detailsTitle}>Content:</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.touchableOpacity} onPress={() => { updateDraft() }}>
                <Text style={styles.buttonText}>Update Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.touchableOpacity} onPress={() => { schedulePost() }}>
                <Text style={styles.buttonText}>Schedule Post</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <TextInput style={styles.input} multiline defaultValue={post[0].text} onChangeText={(value) => setNewPostData(value)} />
            </View>
          </View>
        </View>
      </ScrollView>
    )
  } else {
    return (
      <View><Text>Loading</Text></View>
    )
  }

  function getDate (timestamp) {
    const time = new Date(timestamp) // function that returns the time in a user friendly format
    return time.toLocaleString()
  }

  async function getDraftData () {
    const data = await AsyncStorage.getItem(ID + '_' + UserID + '_' + 'drafts') // gets the draft data out of storage and turns it into JSON
    const jsonData = await JSON.parse(data)
    setPost(jsonData.filter(item => item.draftID === DraftID))
  }

  async function updateDraft (sch = null, schTime = null) {
    if (newPostData !== '') { // will only update the draft if something is present in the imput box
      const data = await AsyncStorage.getItem(ID + '_' + UserID + '_' + 'drafts')
      const jsonData = await JSON.parse(data) // gets all of the drafts out of storage (for this specific user and page)
      for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].draftID === DraftID) {
          const time = (new Date()).toISOString() // finds the post in the array and updates that specific post with new text and a new timestamp
          if (sch === null && schTime === null) {
            jsonData[i].text = newPostData
            jsonData[i].timeStamp = time
          } else {
            jsonData[i].scheduled = 'True'
            jsonData[i].scheduleTime = schTime
          }
        }
      }
      await AsyncStorage.setItem(ID + '_' + UserID + '_' + 'drafts', JSON.stringify(jsonData)) // object has to be in string format to be saved into async storage
      navigation.goBack() // when update, it will navigate back to previous page
    } else {
      setStatus(1) // will show error message is imput box is empty
    }
  }

  async function schedulePost () {
    const valid = dateTimeKey.test(dateTime)
    if (valid) {
      const email = await AsyncStorage.getItem('email')
      const pword = await AsyncStorage.getItem('pword')
      const response = await fetch('http://localhost:3333/api/1.0.0/login', { // POST /login Endpoint
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: pword // stringifys the email and password to send in the body of the request
        })
      })
      if (response.status === 200) {
        const scheduledPosts = await AsyncStorage.getItem('scheduledPosts')
        const str = dateTime.split(' ')
        const dateString = str[0].split('-')
        const timeString = str[1].split(':')
        const date = new Date(dateString[2], dateString[1] - 1, dateString[0], timeString[0], timeString[1], timeString[2])
        const scheduleID = ID + '_' + UserID + '_' + DraftID
        const draftLocation = ID + '_' + UserID + '_' + 'drafts'
        const draftObject = { scheduleID: scheduleID, location: draftLocation, draftID: DraftID, userID: UserID, date: date, email: email, password: pword }
        console.log(scheduledPosts)
        if (scheduledPosts) {
          const body = await JSON.parse(scheduledPosts)
          console.log(body)
          if (body.length > 0) {
            var present = false
            var index = 0
            for (let i = 0; i < body.length; i++) {
              if (body[i].scheduleID === scheduleID) {
                present = true
                index = i
              }
            }
            if (present) {
              body[index].date = draftObject.date
              updateDraft('True', draftObject.date)
              changeSchedule(draftObject)
            } else {
              body.push(draftObject)
              updateDraft('True', draftObject.date)
              setSchedule(draftObject)
            }
            AsyncStorage.setItem('scheduledPosts', JSON.stringify(body))
          } else {
            newStorage(draftObject)
          }
        } else {
          newStorage(draftObject)
        }
      } else {
        console.log(response.status)
      }
      async function newStorage (draftObject) {
        AsyncStorage.setItem('scheduledPosts', JSON.stringify([draftObject]))
        setSchedule(draftObject)
      }
    } else {
      setStatus(2)
    }
  }

  function setSchedule (draftObject) {
    const job = schedule.scheduleJob(draftObject.date, async function () {
      const draftsStr = await AsyncStorage.getItem(draftObject.location)
      const draftsJSON = await JSON.parse(draftsStr)
      const draft = draftsJSON.filter(item => item.draftID === draftObject.draftID)
      const response = await fetch('http://localhost:3333/api/1.0.0/login', { // POST /login Endpoint
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email: draftObject.email,
          password: draftObject.password // stringifys the email and password to send in the body of the request
        })
      })
      if (response.status === 200) {
        const body = await response.json()
        const response2 = await fetch('http://localhost:3333/api/1.0.0/user/' + draftObject.userID + '/post', { // POST /user/{user_id}/post Endpoint
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'X-Authorization': body.token
          },
          body: JSON.stringify({ // stringify the new post data in the body of the request
            text: draft[0].text
          })
        })
        if (response2.status === 201) {
          const removed = draftsJSON.filter(item => item.draftID !== draftObject.draftID)
          AsyncStorage.setItem(draftObject.location, JSON.stringify(removed))
        } else {
          for (let i = 0; i < draftsJSON.length; i++) {
            if (draftsJSON[i].draftID === draftObject.draftID) {
              draftsJSON[i].scheduled = 'Error'
              draftsJSON[i].scheduleTime = ''
            }
          }
          AsyncStorage.setItem(draftObject.location, JSON.stringify(draftsJSON))
        }
        console.log(response2.status)
      } else {
        console.log(response.status)
      }
      // const index = global.activeDrafts.indexOf()
      // global.activeDrafts.r
    })
    // global.activeDrafts.push({draftObject.scheduleID: job})
    console.log(global.activeDrafts)
  }

  function changeSchedule (draftObject) {
    const job = schedule.scheduleJob(draftObject.date, function () {
      console.log(draftObject.scheduleID)
    })
    global.ActivePosts.push(job)
  }

  function warning () { // function returns error message
    if (status === 1) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: 'red' }}>Cannot Submit empty draft</Text>
        </View>
      )
    } else if (status === 2) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: 'red' }}>Invalid date, should be in format: DD-MM-YYYY hh:mm:ss</Text>
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
    flex: 10,
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
  dateInput: {
    borderWidth: 3,
    borderRadius: 10,
    minWidth: '100%',
    // flex: 1,
    marginBottom: 10,
    padding: 5
  },
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 3,
    minWidth: '100%'
  },
  bottomContainer: {
    flex: 5,
    minWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center'
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
    fontSize: 15,
    paddingTop: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  detailsTitle: {
    fontWeight: 'bold',
    fontSize: 30,
    minHeight: 20
  },
  detailsTitleView: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center'
  },
  detailsTitleViewWarning: {
    flex: 1,
    minHeight: 60,
    alignItems: 'center'
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
  }
})

export default EditDraft
