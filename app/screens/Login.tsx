import { View, TextInput, Text, ActivityIndicator, Button, Keyboard, KeyboardAvoidingView} from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import styles from '../styles';


const Login = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const auth = FIREBASE_AUTH;
    // const db = FIREBASE_DB;

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert('Check your emails!')
        } catch (error: any) {
            console.log(error);
            alert('Sign In failed: ' + error.message);
        }finally {
            setLoading(false);
        }
        setLoading(false);
    };

    const signUp = async () => {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert('Check your emails!')
        } catch (error: any) {
            console.log(error);
            alert('Sign Up failed: ' + error.message);
        }finally {
            setLoading(false);
        }
        setLoading(false);
    };

  return (
    <View style = {styles.container}>
     {/* <KeyboardAvoidingView behavior="padding">    */}
        <Text>Login</Text>
      <TextInput value={email} style = {styles.input} placeholder="Email" autoCapitalize="none" onChangeText={(text) => setEmail(text)}></TextInput>
      <TextInput secureTextEntry={true} value={password} style = {styles.input} placeholder="password" autoCapitalize="none" onChangeText={(text) => setPassword(text)}></TextInput>

      { loading ? (
        <ActivityIndicator size="large" color="#0000ff" /> 
       ) : (
       <>
      <Button title="Login"  onPress={signIn} />
      <Button title="Create Account" onPress={signUp} />
      </>
       )
    }
    {/* </KeyboardAvoidingView> */}
    </View>
  );
};

export default Login;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     input: {
//         height: 40,
//         width: '90%',
//         margin: 12,
//         borderWidth: 1,
//         padding: 10,
//     },
   
// });


