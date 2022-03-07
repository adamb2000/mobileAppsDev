import React, { useState } from 'react'
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native'
const image = require('./spacebook.jpg')

function SignUp ({ navigation }) {
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [unsuccessful, setUnsuccessful] = useState(0)
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')
  const [input3, setInput3] = useState('')
  const [input4, setInput4] = useState('')

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.outerContainer}>
        <View style={styles.Title}>
          <Image source={image} style={{ width: 250, height: 250 }} />
          <Text style={{ fontSize: 50, color: '#252525' }}>SPACEBOOK</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} ref={ref => { setInput1(ref) }} placeholder='First Name' onChangeText={(value) => setFirstName(value)} />
          <TextInput style={styles.input} ref={ref => { setInput2(ref) }} placeholder='Second Name' onChangeText={(value) => setSecondName(value)} />
          <TextInput style={styles.input} ref={ref => { setInput3(ref) }} placeholder='Email' onChangeText={(value) => setEmail(value)} />
          <TextInput style={styles.input} ref={ref => { setInput4(ref) }} placeholder='Password' onChangeText={(value) => setPassword(value)} />
        </View>
        {warning()}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.touchableOpacity} onPress={newUserApiCall}>
            <Text style={styles.buttonText}>
              Submit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>
              Back To Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )

  async function newUserApiCall () {
    if (firstName !== '' && secondName !== '' && email !== '' && password !== '') {
      if (password.length > 5) {
        const response = await fetch('http://localhost:3333/api/1.0.0/user', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: secondName,
            email: email,
            password: password
          })
        })
        if (response.status === 201) {
          setUnsuccessful(1)
          input1.clear()
          input2.clear()
          input3.clear()
          input4.clear()
          setFirstName('')
          setSecondName('')
          setEmail('')
          setPassword('')
        } else if (response.status === 400) {
          const responseBody = await response.text()
          if (responseBody === 'Bad Request - body must match specification and email must be correct') {
            setUnsuccessful(5)
          } else if (responseBody === 'Bad request - email must be valid and password greater than 5 characters') {
            setUnsuccessful(6)
          } else {
            setUnsuccessful(2)
          }
        } else if (response.status === 500) {
          setUnsuccessful(3)
        }
      } else {
        setUnsuccessful(6)
      }
    } else {
      (
        setUnsuccessful(4)
      )
    }
  }

  function warning () {
    if (unsuccessful === 1) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: 'green' }}>Success! Account Created</Text>
        </View>
      )
    } else if (unsuccessful === 2) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: '#252525' }}>Account with this email already exists</Text>
        </View>
      )
    } else if (unsuccessful === 3) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: '#252525' }}>Server Error</Text>
        </View>
      )
    } else if (unsuccessful === 4) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: '#252525' }}>Invalid Account Details</Text>
        </View>
      )
    } else if (unsuccessful === 5) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: '#252525' }}>Invalid Email Address</Text>
        </View>
      )
    } else if (unsuccessful === 6) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: '#252525' }}>Password Must be Greater than 5 Characters</Text>
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

export default SignUp
