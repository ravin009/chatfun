import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

const PrivacySettingsScreen = ({ navigation }) => {
    const { user, setUser } = useContext(AuthContext);
    const [privacySetting, setPrivacySetting] = useState(user.privacySetting || 'all');
    const [alertVisible, setAlertVisible] = useState(false); // Add alertVisible state
    const [alertTitle, setAlertTitle] = useState(''); // Add alertTitle state
    const [alertMessage, setAlertMessage] = useState(''); // Add alertMessage state
    const [alertType, setAlertType] = useState(''); // Add alertType state

    const handleSavePrivacySetting = async () => {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
            setAlertTitle('Error');
            setAlertMessage('User is not authenticated. Please log in again.');
            setAlertType('error'); // Set alert type to error
            setAlertVisible(true);
            return;
        }

        try {
            const res = await axios.put('https://chatfun-backend.onrender.com/api/user/updatePrivacySetting', { privacySetting }, {
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
            setAlertMessage('Privacy settings updated successfully');
            setAlertType('success'); // Set alert type to success
            setAlertVisible(true);
            navigation.goBack();
        } catch (err) {
            console.error('Error updating privacy settings:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('Error updating privacy settings');
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
            <Text style={styles.title}>Privacy Settings</Text>
            <TouchableOpacity
                style={[styles.optionButton, privacySetting === 'all' && styles.selectedOption]}
                onPress={() => setPrivacySetting('all')}
            >
                <Text style={styles.optionText}>Accept messages from all</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.optionButton, privacySetting === 'friends' && styles.selectedOption]}
                onPress={() => setPrivacySetting('friends')}
            >
                <Text style={styles.optionText}>Accept messages from friends only</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.optionButton, privacySetting === 'disabled' && styles.selectedOption]}
                onPress={() => setPrivacySetting('disabled')}
            >
                <Text style={styles.optionText}>Disable private messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSavePrivacySetting}>
                <LinearGradient
                    colors={['#6a11cb', '#2575fc']}
                    style={styles.buttonBackground}
                >
                    <FontAwesome name="save" size={24} color="white" />
                    <Text style={styles.buttonText}>Save Settings</Text>
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
    optionButton: {
        width: '80%',
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    optionText: {
        color: '#fff',
        fontSize: 16,
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

export default PrivacySettingsScreen;
