import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, TouchableOpacity,Image,StyleSheet } from 'react-native';

function LogOut({navigation}){
  
    return(
        <View style={styles.outerContainer}>
            <Text>Are you sure you want to log out?</Text>
            <TouchableOpacity style={styles.touchableOpacity} onPress={DoLogOut}>
            <Text style={styles.buttonText}>LogOut</Text>
            </TouchableOpacity>
        </View> 
    ); 

    async function DoLogOut(){
        const token = await AsyncStorage.getItem('token');
        fetch("http://localhost:3333/api/1.0.0/logout",{
          method: 'POST',
          headers: {
            'X-Authorization': token
          },
          
      })
        AsyncStorage.removeItem('token');
        AsyncStorage.removeItem('id');
        navigation.navigate('Login')

    }
  }
  


  const styles = StyleSheet.create({
    outerContainer: {
      width: 393,
      height: 851,
      backgroundColor: 'white',
      alignItems: 'center',
    },
    touchableOpacity:{
      width: 130,
      height: 20,
      marginTop:10,
      border: 'solid',
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: "#252525",
    },
    buttonText:{
      color: "white",
    },
  })

  export default LogOut;