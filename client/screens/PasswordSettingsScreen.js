import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';

const PasswordSettingsScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState(''); // Add alertType state

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            setAlertTitle('Error');
            setAlertMessage('Passwords do not match.');
            setAlertType('error'); // Set alert type to error
            setAlertVisible(true);
            return;
        } else {
            setPasswordError('');
        }

        const token = await AsyncStorage.getItem('token');

        if (!token) {
            setAlertTitle('Error');
            setAlertMessage('User is not authenticated. Please log in again.');
            setAlertType('error'); // Set alert type to error
            setAlertVisible(true);
            return;
        }

        try {
            await axios.put('http://192.168.202.192:5000/api/user/changePassword', { currentPassword, newPassword }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAlertTitle('Success');
            setAlertMessage('Password changed successfully');
            setAlertType('success'); // Set alert type to success
            setAlertVisible(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Error changing password:', err.response ? err.response.data : err.message);
            if (err.response && err.response.data && err.response.data.error) {
                setPasswordError(err.response.data.error);
                setAlertTitle('Error');
                setAlertMessage(err.response.data.error);
                setAlertType('error'); // Set alert type to error
            } else {
                setAlertTitle('Error');
                setAlertMessage('Error changing password');
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
            <Text style={styles.title}>Change Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Current Password"
                placeholderTextColor="#ccc"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
            />
            <TextInput
                style={[styles.input, passwordError ? styles.errorInput : null]}
                placeholder="New Password"
                placeholderTextColor="#ccc"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
            />
            <TextInput
                style={[styles.input, passwordError ? styles.errorInput : null]}
                placeholder="Confirm New Password"
                placeholderTextColor="#ccc"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                <LinearGradient
                    colors={['#6a11cb', '#2575fc']}
                    style={styles.buttonBackground}
                >
                    <FontAwesome name="save" size={24} color="white" />
                    <Text style={styles.buttonText}>Change Password</Text>
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

export default PasswordSettingsScreen;
