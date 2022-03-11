import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Camera } from 'expo-camera'

function TakePhoto ({ navigation }) {
  const [loaded, setLoaded] = useState(false)
  const [token, setToken] = useState('')
  const [ID, setID] = useState('')

  const [types, setType] = useState()
  const [hasPermission, setHasPermission] = useState(null)
  const [cameraRef, setCameraRef] = useState('')

  useEffect(async () => {
    setType(Camera.Constants.Type.front)
    AsyncStorage.getItem('id').then((value) => setID(value))
    AsyncStorage.getItem('token').then((value) => setToken(value))
    const status = await Camera.requestCameraPermissionsAsync() // have to request access to the camera before it can be used
    setHasPermission(status.status)
  }, [])

  useEffect(() => {
    if (hasPermission === 'granted') { // only show loaded render when camera permission has been granted
      setLoaded(true)
    }
  }, [hasPermission])

  if (loaded) {
    return (
      <View style={styles.outerContainer}>
        <Camera style={styles.camera} type={types} ref={ref => setCameraRef(ref)}>
          <View style={styles.buttonView}>
            <TouchableOpacity style={styles.touchableOpacity} onPress={async () => { capturePhoto() }}>
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    )
  } else {
    return (
      <View><Text>Loading</Text></View>
    )
  }

  async function sendToServer (data) {
    const capture = await fetch(data.base64)
    const blob = await capture.blob()
    const response = fetch('http://localhost:3333/api/1.0.0/user/' + ID + '/photo', { // POST /user/{user_id}/photo
      method: 'POST',
      headers: {
        'Content-Type': 'image/png', // change type to image
        'X-Authorization': token
      },
      body: blob
    })
    console.log(response.status)
  }

  async function capturePhoto () {
    if (cameraRef) {
      const options = { quality: 0.5, base64: true, onPictureSaved: (data) => sendToServer(data) } // capture the photo with specified options and then run sendToServer function with the newly taken photo
      const photo = await cameraRef.takePictureAsync(options)
      console.log('photo', photo)
    }
  }
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  innerContainer: {
    alignItems: 'center',
    flex: 6
  },
  touchableOpacity: {
    marginTop: 10,
    width: 100,
    marginBottom: 20,
    border: 'solid',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252525',
    flex: 1
  },
  buttonView: {
    flex: 0.1
  },
  buttonText: {
    color: 'white'
  },
  text: {
    color: '#252525',
    fontSize: 20
  },
  camera: {
    flex: 10,
    width: '100%',
    alignItems: 'center'
  }
})

export default TakePhoto
