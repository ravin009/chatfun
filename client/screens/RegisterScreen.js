import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = ({ navigation }) => {
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nicknameError, setNicknameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const { register } = useContext(AuthContext);

    const isValidNickname = (nickname) => /^(?!\s)[\s\S]+$/.test(nickname);

    const handleRegister = async () => {
        if (!isValidNickname(nickname)) {
            setNicknameError('Nickname cannot start with a space.');
            return;
        } else {
            setNicknameError('');
        }

        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        } else {
            setPasswordError('');
        }

        try {
            await register(nickname, email, password);
            // Only navigate to Chat if registration is successful
            if (await AsyncStorage.getItem('token')) {
                navigation.navigate('Chat');
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                if (err.response.data.error.includes('Nickname')) {
                    setNicknameError(err.response.data.error);
                } else if (err.response.data.error.includes('Email')) {
                    setEmailError(err.response.data.error);
                } else {
                    Alert.alert('Registration Failed', err.response.data.error);
                }
            } else {
                Alert.alert('Registration Failed', 'An error occurred during registration. Please try again.');
            }
        }
    };

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <Image
                source={require('../assets/ChatFun_Logo.png')}
                style={styles.logo}
                alt="Chatify logo with a 1:1 ratio"
            />
            <Text style={styles.title}>Register</Text>
            <View style={styles.inputContainer}>
                <FontAwesome name="user" size={24} color="white" />
                <TextInput
                    style={[styles.input, nicknameError ? styles.errorInput : null]}
                    placeholder="Nickname"
                    placeholderTextColor="#ccc"
                    value={nickname}
                    onChangeText={setNickname}
                />
            </View>
            {nicknameError ? <Text style={styles.errorText}>{nicknameError}</Text> : null}
            <View style={styles.inputContainer}>
                <FontAwesome name="envelope" size={24} color="white" />
                <TextInput
                    style={[styles.input, emailError ? styles.errorInput : null]}
                    placeholder="Email"
                    placeholderTextColor="#ccc"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            <View style={styles.inputContainer}>
                <FontAwesome name="lock" size={24} color="white" />
                <TextInput
                    style={[styles.input, passwordError ? styles.errorInput : null]}
                    placeholder="Password"
                    placeholderTextColor="#ccc"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>
            <View style={styles.inputContainer}>
                <FontAwesome name="lock" size={24} color="white" />
                <TextInput
                    style={[styles.input, passwordError ? styles.errorInput : null]}
                    placeholder="Confirm Password"
                    placeholderTextColor="#ccc"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <LinearGradient
                    colors={['#ff512f', '#dd2476']}
                    style={styles.buttonBackground}
                >
                    <Text style={styles.buttonText}>Register</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150, // Adjust the size as needed
        height: 150, // Ensure the height matches the width for a 1:1 ratio
        marginBottom: 20, // Add some space below the logo
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        color: '#fff', // Make the title text white for better contrast
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: '#fff', // Make the input text white for better contrast
    },
    button: {
        width: '80%',
        marginBottom: 15, // Add some space between the buttons
    },
    buttonBackground: {
        padding: 15,
        borderRadius: 25, // Make the corners rounded
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    link: {
        marginTop: 10,
        color: '#fff',
        textDecorationLine: 'underline',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    errorInput: {
        borderColor: 'red',
    },
});

export default RegisterScreen;
