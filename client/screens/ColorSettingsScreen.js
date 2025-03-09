import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ColorWheel } from 'react-native-color-wheel';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

const ColorSettingsScreen = ({ navigation }) => {
    const { user, setUser } = useContext(AuthContext);
    const [nicknameColor, setNicknameColor] = useState(user.nicknameColor || '#000000');
    const [chatTextColor, setChatTextColor] = useState(user.chatTextColor || '#000000');
    const [nicknameColorError, setNicknameColorError] = useState('');
    const [chatTextColorError, setChatTextColorError] = useState('');
    const [alertVisible, setAlertVisible] = useState(false); // Add alertVisible state
    const [alertTitle, setAlertTitle] = useState(''); // Add alertTitle state
    const [alertMessage, setAlertMessage] = useState(''); // Add alertMessage state
    const [alertType, setAlertType] = useState(''); // Add alertType state

    const isValidHex = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

    const handleSaveColors = async () => {
        if (!isValidHex(nicknameColor)) {
            setNicknameColorError('Invalid hex color code');
            setAlertTitle('Error');
            setAlertMessage('Invalid hex color code for nickname color.');
            setAlertType('error'); // Set alert type to error
            setAlertVisible(true);
            return;
        } else {
            setNicknameColorError('');
        }

        if (!isValidHex(chatTextColor)) {
            setChatTextColorError('Invalid hex color code');
            setAlertTitle('Error');
            setAlertMessage('Invalid hex color code for chat text color.');
            setAlertType('error'); // Set alert type to error
            setAlertVisible(true);
            return;
        } else {
            setChatTextColorError('');
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
            const res = await axios.put('http://192.168.172.192:5000/api/user/updateColors', { nicknameColor, chatTextColor }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Re-fetch user data
            const userRes = await axios.get('http://192.168.172.192:5000/api/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(userRes.data);
            setAlertTitle('Success');
            setAlertMessage('Colors updated successfully');
            setAlertType('success'); // Set alert type to success
            setAlertVisible(true);
            navigation.goBack();
        } catch (err) {
            console.error('Error updating colors:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('Error updating colors');
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
            <Text style={styles.title}>Color Settings</Text>
            <View style={styles.colorPickerContainer}>
                <Text style={styles.label}>Nickname Color</Text>
                <ColorWheel
                    initialColor={nicknameColor}
                    onColorChangeComplete={color => setNicknameColor(color)}
                    style={styles.colorPicker}
                />
                <TextInput
                    style={[styles.input, nicknameColorError ? styles.errorInput : null]}
                    placeholder="Hex Code"
                    placeholderTextColor="#ccc"
                    value={nicknameColor}
                    onChangeText={setNicknameColor}
                />
                {nicknameColorError ? <Text style={styles.errorText}>{nicknameColorError}</Text> : null}
            </View>
            <View style={styles.colorPickerContainer}>
                <Text style={styles.label}>Chat Text Color</Text>
                <ColorWheel
                    initialColor={chatTextColor}
                    onColorChangeComplete={color => setChatTextColor(color)}
                    style={styles.colorPicker}
                />
                <TextInput
                    style={[styles.input, chatTextColorError ? styles.errorInput : null]}
                    placeholder="Hex Code"
                    placeholderTextColor="#ccc"
                    value={chatTextColor}
                    onChangeText={setChatTextColor}
                />
                {chatTextColorError ? <Text style={styles.errorText}>{chatTextColorError}</Text> : null}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSaveColors}>
                <LinearGradient
                    colors={['#6a11cb', '#2575fc']}
                    style={styles.buttonBackground}
                >
                    <FontAwesome name="save" size={24} color="white" />
                    <Text style={styles.buttonText}>Save Colors</Text>
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
    colorPickerContainer: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        color: '#fff',
    },
    colorPicker: {
        width: '100%',
        height: 200,
        marginBottom: 10,
    },
    input: {
        width: '80%',
        padding: 10,
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
        marginTop: 5,
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

export default ColorSettingsScreen;
