import React, { useEffect, useState,useRef} from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
const image = require('./spacebook.jpg');


function TakePhoto({ navigation }) {
    const [loaded, setLoaded] = useState(false);
    const [token, setToken] = useState("");
    const [ID, setID] = useState("");

    const [types,setType] = useState(Camera.Constants.Type.front);
    const [hasPermission, setHasPermission] = useState(null);
    const cameraRef = useRef(null);




    useEffect(async () => {
        AsyncStorage.getItem('id').then((value) => setID(value));
        AsyncStorage.getItem('token').then((value) => setToken(value));
        const status = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status.status);
    }, []);

    useEffect(() => {
        console.log(hasPermission);
        if (hasPermission == "granted") {   
            setLoaded(true);
        }
    }, [hasPermission]);



    if (loaded) {
        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.outerContainer}>
                    <View style={styles.innerContainer}>
                        <TouchableOpacity style={{alignSelf: 'center'}} onPress={async() => {capturePhoto()}}>
                            <Text>Take Photo</Text>
                        </TouchableOpacity>
                        <Camera style={{flex: 1,width:"100%"}} type={types} ref={cameraRef}>
                        </Camera>
                    </View>
                </View>
            </ScrollView>
        );
    }
    else {
        return (
            <View><Text>Loading</Text></View>
        )
    }




    async function capturePhoto() {
        if(cameraRef){
            let photo = await cameraRef.takePictureAsync();
            console.log('photo', photo);
            }
    }


    async function sendToServer(data){

        let capture = await fetch(data.base64);
        let blob = await response.blob();

        const response = fetch("http://localhost:3333/api/1.0.0/user/"+ID+"/photo",{
            method: "POST",
            headers:{
                "Content-Type": "image/png",
                "X-Authorization": token
            },
            body: blob
        });
        console.log(response.status);
    }





}


const styles = StyleSheet.create({
    outerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'white',
    },
    innerContainer: {
        alignItems: 'center',
        flex: 6,
    },
    touchableOpacity: {
        width: 130,
        height: 20,
        marginTop: 10,
        marginBottom: 20,
        border: 'solid',
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#252525",
    },
    buttonText: {
        color: "white",
    },
    text: {
        color: "#252525",
        fontSize: 20,
    },
});

export default TakePhoto;