import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
const image = require('./spacebook.jpg')

function Login ({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [unsuccessful, setUnsuccessful] = useState(0)
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')

  useEffect(async () => {
    const id = await AsyncStorage.getItem('id')
    const token = await AsyncStorage.getItem('id')
    if(token || id){
      AsyncStorage.removeItem('token')
      AsyncStorage.removeItem('id')
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
          <TextInput style={styles.input} ref={input => { setInput2(input) }} placeholder='Password' onChangeText={(value) => setPassword(value)} />
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
    if(email !== '' && password !== ''){
      const response = await fetch('http://localhost:3333/api/1.0.0/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      if (response.status === 200) {
        setUnsuccessful(0)
        const body = await response.json()
        try {
          await AsyncStorage.setItem('token', body.token)
          await AsyncStorage.setItem('id', body.id)
        } catch (e) {
          console.log('error', e)
        }
        input1.clear()
        input2.clear()
        setEmail('')
        setPassword('')
        navigation.navigate('LoggedIn')
        //console.log(body.token)
        //console.log(body.id)
      } else if(response.status === 400) {
        setUnsuccessful(1)
      } else {
        setUnsuccessful(2)
      }
    } else {
      setUnsuccessful(1)
    }
  }

  function warning () {
    if (unsuccessful === 1) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: 'red' }}>Invalid Credentials</Text>
        </View>
      )
    } else if(unsuccessful === 2){
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
