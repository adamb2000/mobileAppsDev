import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import React, { Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import HomePage from './HomePage.js'
import Login from './Login.js'
import SignUp from './SignUp.js'
import Friends from './Friends.js'
import Search from './Search.js'
import Account from './Account.js'
import LogOut from './LogOut.js'
import User from './User.js'
import Post from './Post.js' // All Pages in the app are imported here
import Requests from './Requests.js'
import TakePhoto from './TakePhoto.js'
import ViewFriends from './ViewFriends.js'
import Drafts from './Drafts.js'
import EditDrafts from './EditDraft.js'

const homeImage = require('./home.png')
const friendsImage = require('./friends.png')
const searchImage = require('./search.png')

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator() // Uses 3 different types of navigators - nested
const Drawer = createDrawerNavigator()

global.activeDrafts = []
// const schedule = require('node-schedule');

function App () {
  const schedule = require('node-schedule')
  checkScheduled()
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Login' component={Login} />
        <Stack.Screen name='SignUp' component={SignUp} />
        <Stack.Screen name='LoggedIn' component={LoggedIn} />
        <Stack.Screen name='User' component={User} options={{ headerShown: true }} />
        <Stack.Screen name='Post' component={Post} options={{ headerShown: true }} />
        <Stack.Screen name='Requests' component={Requests} options={{ headerShown: true }} />
        <Stack.Screen name='TakePhoto' component={TakePhoto} options={{ headerShown: true }} />
        <Stack.Screen name='ViewFriends' component={ViewFriends} options={{ headerShown: true }} />
        <Stack.Screen name='Drafts' component={Drafts} options={{ headerShown: true }} />
        <Stack.Screen name='EditDrafts' component={EditDrafts} options={{ headerShown: true }} />
      </Stack.Navigator>
    </NavigationContainer>
  )

  async function checkScheduled () {
    const bodyStr = await AsyncStorage.getItem('scheduledPosts')
    const body = await JSON.parse(bodyStr)
    console.log(body)
    if (body) {
      console.log(body.length)
      if (body.length > 0) {
        for (let i = 0; i < body.length; i++) {
          const draftObject = body[i]
          const now = new Date(Date.now())
          const date = new Date(draftObject.date)
          if (date < now) {
            const newDate = new Date(Date.now)
            newDate.setSeconds(newDate.getSeconds() + 1)
            draftObject.date = newDate
          }
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
                console.log(201)
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
            } else {
              for (let i = 0; i < draftsJSON.length; i++) {
                if (draftsJSON[i].draftID === draftObject.draftID) {
                  draftsJSON[i].scheduled = 'Error'
                  draftsJSON[i].scheduleTime = ''
                }
              }
              AsyncStorage.setItem(draftObject.location, JSON.stringify(draftsJSON))
            }
            const bodyStr = await AsyncStorage.getItem('scheduledPosts')
            const body = await JSON.parse(bodyStr)
            if (body.length > 1) {
              const removed = body.filter(item => item.scheduleID !== draftObject.scheduleID)
              AsyncStorage.setItem('scheduledPosts', JSON.stringify(removed))
            } else {
              AsyncStorage.removeItem('scheduledPosts')
            }
            const temp = global.activeDrafts
            const removed = temp.filter(item => item.id !== draftObject.scheduleID)
            global.activeDrafts = removed
          })
          const temp = global.activeDrafts
          const object = { id: draftObject.scheduleID, schJob: job }
          temp.push(object)
          global.activeDrafts = temp
        }
      }
    }
  }
}

function LoggedIn () {
  return (
    <Tab.Navigator screenOptions={{ tabBarActiveBackgroundColor: '#a1a1a1', tabBarShowLabel: false, tabBarStyle: { backgroundColor: 'white' } }}>
      <Tab.Screen
        name='HomePage' component={HomeScreen} options={{
          headerShown: false,
          tabBarIcon: () => (
            <Image style={{ width: 30, height: 30 }} source={homeImage} />)
        }}
      />
      <Tab.Screen
        name='Friends' component={Friends} options={{
          headerShown: false,
          tabBarIcon: () => (
            <Image style={{ width: 30, height: 30 }} source={friendsImage} />)
        }}
      />
      <Tab.Screen
        name='Search' component={Search} options={{
          headerShown: false,
          tabBarIcon: () => (
            <Image style={{ width: 30, height: 30 }} source={searchImage} />)
        }}
      />
    </Tab.Navigator>
  )
}

function HomeScreen () {
  return (
    <Drawer.Navigator initialRouteName='Home'>
      <Drawer.Screen name='Home' component={HomePage} />
      <Drawer.Screen name='Account' component={Account} />
      <Drawer.Screen name='LogOut' component={LogOut} />
    </Drawer.Navigator>
  )
}

export default App
