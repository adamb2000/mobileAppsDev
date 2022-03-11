import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
const image = require('./spacebook.jpg')

function Login ({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [unsuccessful, setUnsuccessful] = useState(0)
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('') // input references so they can be cleared using imput.clear()

  useEffect(async () => {
    const id = await AsyncStorage.getItem('id')
    const token = await AsyncStorage.getItem('id')
    const email = await AsyncStorage.getItem('email')
    const pword = await AsyncStorage.getItem('pword')
    if (token || id || pword || email) {
      AsyncStorage.removeItem('token') // removes any tokens or ID that are saved into storage (from a previous session without logging out properly)
      AsyncStorage.removeItem('id')
      AsyncStorage.removeItem('email')
      AsyncStorage.removeItem('pword')
    }
  }, [])

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Image source={image} style={{ width: 250, height: 250 }} />
          <Text style={{ fontSize: 50, color: '#252525' }}>SPACEBOOK</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} ref={input => { setInput1(input) }} placeholder='Email' onChangeText={(value) => setEmail(value)} />
          <TextInput style={styles.input} ref={input => { setInput2(input) }} secureTextEntry={true} placeholder='Password' onChangeText={(value) => setPassword(value)} />
        </View>
        {warning()}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.touchableOpacity} onPress={loginApiCall}>
            <Text style={styles.buttonText}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.buttonText}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )

  async function loginApiCall () {
    if (email !== '' && password !== '') {
      const response = await fetch('http://localhost:3333/api/1.0.0/login', { // POST /login Endpoint
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password // stringifys the email and password to send in the body of the request
        })
      })
      if (response.status === 200) {
        setUnsuccessful(0) //
        const body = await response.json() // if request is successful, get ID and token from response and save to async storage
        try {
          await AsyncStorage.setItem('token', body.token)
          await AsyncStorage.setItem('id', body.id)
          await AsyncStorage.setItem('email', email)
          await AsyncStorage.setItem('pword', password)
        } catch (e) {
          console.log('error', e)
        }
        input1.clear()
        input2.clear() // clear all input boxes if login is successful
        setEmail('')
        setPassword('')
        navigation.navigate('LoggedIn') // navigate to loggedIn which is a tab navigator with a drawer navigator nested inside
      } else if (response.status === 400) {
        setUnsuccessful(1) // if login is not successful, display message to user explaining why
      } else {
        setUnsuccessful(2)
      }
    } else {
      setUnsuccessful(1)
    }
  }

  function warning () { // function retunrs text explaining why login was not successful
    if (unsuccessful === 1) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: 'red' }}>Invalid Credentials</Text>
        </View>
      )
    } else if (unsuccessful === 2) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: 'red' }}>Server Error</Text>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  inputContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  Title: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center'
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
    marginTop: 10,
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

export default Login
