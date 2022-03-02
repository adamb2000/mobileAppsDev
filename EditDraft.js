import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

function EditDraft ({ route, navigation }) {
  const [loaded, setLoaded] = useState(1)
  const [newPostData, setNewPostData] = useState('')
  const [post, setPost] = useState(null)
  const [status, setStatus] = useState(0)
  const ID = route.params.ID
  const UserID = route.params.UserID
  const DraftID = route.params.draftID

  useEffect(() => {
    if(post===null){
        getDraftData()
    } else {
        console.log(post)
        setNewPostData(post[0].text)
        setLoaded(3)
    }
    
  }, [post])

  if (loaded === 3) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.outerContainer}>
          <View style={styles.detailsTitleView}>
            <Text style={styles.detailsTitle}>Details:</Text>
          </View>
          <View style={styles.innerContainer}>
            <View style={styles.detailsContainer}>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Last Updated: </Text><Text style={styles.detailsText}>{getDate(post[0].timeStamp)}</Text></View>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Post Scheduled: </Text><Text style={styles.detailsText}>{post[0].scheduled}</Text></View>
              <View style={styles.detailsView}><Text style={styles.detailsField}>Schedule Time: </Text><Text style={styles.detailsText}>{post[0].scheduleTime}</Text></View>
            </View>
          </View>
          <View style={styles.detailsTitleView}>
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
      </ScrollView>
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
    const jsonData = await JSON.parse(data)
    setPost(jsonData.filter(item => item.draftID === DraftID))
  }


  async function updateDraft(){
    if(newPostData !== ''){
        const data = await AsyncStorage.getItem(ID + '_' + UserID + '_' + 'drafts')
        const jsonData = await JSON.parse(data)
        for(let i=0;i<jsonData.length;i++){
            if(jsonData[i].draftID === DraftID){
                const time = (new Date).toISOString()
                jsonData[i].text = newPostData
                jsonData[i].timeStamp = time
            }
        }
        await AsyncStorage.setItem(ID + '_' + UserID + '_' + 'drafts', JSON.stringify(jsonData))
        navigation.goBack()
    } else {
        setStatus(1)
    }
  }

  async function schedulePost(){

  }
  

  function warning () {
    if (status === 1) {
      return (
        <View>
          <Text style={{ fontSize: 20, color: 'red' }}>Cannot Submit empty draft</Text>
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
    flex: 17,
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
  innerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 6,
    minWidth: '100%'
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
    fontSize: 20,
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
    minHeight:60,
    alignItems:'center'
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
