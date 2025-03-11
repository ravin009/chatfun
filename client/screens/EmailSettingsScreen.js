import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

const EmailSettingsScreen = ({ navigation }) => {
    const { user, setUser } = useContext(AuthContext);
    const [email, setEmail] = useState(user.email);
    const [emailError, setEmailError] = useState('');
    const [alertVisible, setAlertVisible] = useState(false); // Add alertVisible state
    const [alertTitle, setAlertTitle] = useState(''); // Add alertTitle state
    const [alertMessage, setAlertMessage] = useState(''); // Add alertMessage state
    const [alertType, setAlertType] = useState(''); // Add alertType state

    const handleUpdateEmail = async () => {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            setAlertTitle('Error');
            setAlertMessage('User is not authenticated. Please log in again.');
            setAlertType('error'); // Set alert type to error
            setAlertVisible(true);
            return;
        }

        try {
            const res = await axios.put('https://chatfun-backend.onrender.com/api/user/updateEmail', { email }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Re-fetch user data
            const userRes = await axios.get('https://chatfun-backend.onrender.com/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(userRes.data);
            setAlertTitle('Success');
            setAlertMessage('Email updated successfully');
            setAlertType('success'); // Set alert type to success
            setAlertVisible(true);
            navigation.goBack();
        } catch (err) {
            console.error('Error updating email:', err.response ? err.response.data : err.message);
            if (err.response && err.response.data && err.response.data.error) {
                setEmailError(err.response.data.error);
                setAlertTitle('Error');
                setAlertMessage(err.response.data.error);
                setAlertType('error'); // Set alert type to error
            } else {
                setAlertTitle('Error');
                setAlertMessage('Error updating email');
                setAlertType('error'); // Set alert type to error
            }
            setAlertVisible(true);
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
            <Text style={styles.title}>Update Email</Text>
            <TextInput
                style={[styles.input, emailError ? styles.errorInput : null]}
                placeholder="Email"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleUpdateEmail}>
                <LinearGradient
                    colors={['#6a11cb', '#2575fc']}
                    style={styles.buttonBackground}
                >
                    <FontAwesome name="save" size={24} color="white" />
                    <Text style={styles.buttonText}>Update Email</Text>
                </LinearGradient>
            </TouchableOpacity>
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onConfirm={() => setAlertVisible(false)}
                type={alertType} // Pass alert type to CustomAlert
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 100, // Adjust the size as needed
        height: 100, // Ensure the height matches the width for a 1:1 ratio
        marginBottom: 20, // Add some space below the logo
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        color: '#fff', // Make the title text white for better contrast
    },
    input: {
        width: '80%',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#fff', // Make the input text white for better contrast
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    button: {
        width: '80%',
        marginBottom: 15, // Add some space between the buttons
    },
    buttonBackground: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 25, // Make the corners rounded
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
        marginLeft: 10, // Add some space between the icon and the text
    },
});

export default EmailSettingsScreen;
