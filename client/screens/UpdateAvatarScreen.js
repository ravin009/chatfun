import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AvatarPicker from '../components/AvatarPicker';

const UpdateAvatarScreen = ({ navigation }) => {
    const { user, setUser } = useContext(AuthContext);
    const [avatar, setAvatar] = useState(user.avatar ? `https://chatfun-backend.onrender.com/${user.avatar}` : null);

    const handleUpdateAvatar = async () => {
        const token = await AsyncStorage.getItem('token'); 

        if (!token) {
            Alert.alert('Error', 'User is not authenticated. Please log in again.');
            return;
        }

        const formData = new FormData();

        if (avatar && avatar !== user.avatar) {
            const uriParts = avatar.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('avatar', {
                uri: avatar,
                name: `avatar.${fileType}`,
                type: `image/${fileType}`,
            });
        }

        try {
            const res = await axios.put('https://chatfun-backend.onrender.com/api/user/updateAvatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(res.data);
            setAvatar(res.data.avatar ? `https://chatfun-backend.onrender.com/${res.data.avatar}?${new Date().getTime()}` : null); // Add cache-busting query parameter
            Alert.alert('Success', 'Avatar updated successfully');
            navigation.goBack();
        } catch (err) {
            console.error('Error updating avatar:', err.response ? err.response.data : err.message);
            Alert.alert('Error', 'Error updating avatar');
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
            <Text style={styles.title}>Update Avatar</Text>
            <AvatarPicker avatar={avatar} setAvatar={setAvatar} />
            <TouchableOpacity style={styles.button} onPress={handleUpdateAvatar}>
                <LinearGradient
                    colors={['#6a11cb', '#2575fc']}
                    style={styles.buttonBackground}
                >
                    <FontAwesome name="save" size={24} color="white" />
                    <Text style={styles.buttonText}>Update Avatar</Text>
                </LinearGradient>
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

export default UpdateAvatarScreen;
