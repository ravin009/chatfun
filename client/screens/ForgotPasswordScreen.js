import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [alertVisible, setAlertVisible] = useState(false); // Add alertVisible state
    const [alertTitle, setAlertTitle] = useState(''); // Add alertTitle state
    const [alertMessage, setAlertMessage] = useState(''); // Add alertMessage state
    const [alertType, setAlertType] = useState(''); // Add alertType state

    const handleForgotPassword = async () => {
        try {
            await axios.post('http://192.168.202.192:5000/api/auth/send-reset-password-otp', { email });
            setAlertTitle('Success');
            setAlertMessage('OTP sent to your email');
            setAlertType('success'); // Set alert type to success
            setAlertVisible(true);
            navigation.navigate('ResetPassword', { email });
        } catch (err) {
            console.error('Error sending OTP:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage(err.response ? err.response.data.error : 'An error occurred. Please try again.');
            setAlertType('error'); // Set alert type to error
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
            <Text style={styles.title}>Forgot Password</Text>
            <View style={styles.inputContainer}>
                <FontAwesome name="envelope" size={24} color="white" />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#ccc"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                <LinearGradient
                    colors={['#6a11cb', '#2575fc']}
                    style={styles.buttonBackground}
                >
                    <Text style={styles.buttonText}>Send OTP</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Back to Login</Text>
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
});

export default ForgotPasswordScreen;
