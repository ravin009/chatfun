import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UpdatePersonalInfoScreen = ({ navigation }) => {
    const { user, setUser } = useContext(AuthContext);
    const [nickname, setNickname] = useState(user.nickname);
    const [maritalStatus, setMaritalStatus] = useState(user.maritalStatus || 'Single');
    const [dateOfBirth, setDateOfBirth] = useState(new Date(user.dateOfBirth || Date.now()));
    const [gender, setGender] = useState(user.gender || 'Female');
    const [country, setCountry] = useState(user.country || '');
    const [bio, setBio] = useState(user.bio || '');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleUpdateProfile = async () => {
        const token = await AsyncStorage.getItem('token'); 

        if (!token) {
            Alert.alert('Error', 'User is not authenticated. Please log in again.');
            return;
        }

        const formData = new FormData();
        formData.append('nickname', nickname);
        formData.append('maritalStatus', maritalStatus);
        formData.append('dateOfBirth', dateOfBirth.toISOString());
        formData.append('gender', gender);
        formData.append('country', country);
        formData.append('bio', bio);

        try {
            const res = await axios.put('http://192.168.172.192:5000/api/user/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setUser(res.data);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (err) {
            console.error('Error updating profile:', err.response ? err.response.data : err.message);
            Alert.alert('Error', 'Error updating profile');
        }
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || dateOfBirth;
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

        if (currentDate > minDate) {
            Alert.alert('Invalid Date', 'You must be at least 18 years old.');
            setShowDatePicker(false);
            return;
        }

        setShowDatePicker(false);
        setDateOfBirth(currentDate);
    };

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Image
                    source={require('../assets/ChatFun_Logo.png')}
                    style={styles.logo}
                    alt="Chatify logo with a 1:1 ratio"
                />
                <Text style={styles.title}>Update Personal Information</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nickname"
                    placeholderTextColor="#ccc"
                    value={nickname}
                    onChangeText={setNickname}
                />
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={maritalStatus}
                        style={styles.picker}
                        onValueChange={(itemValue) => setMaritalStatus(itemValue)}
                    >
                        <Picker.Item label="Single" value="Single" />
                        <Picker.Item label="Married" value="Married" />
                    </Picker>
                </View>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.input}>{dateOfBirth.toDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={dateOfBirth}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        textColor="blue" // Set text color for iOS
                        style={styles.datePicker} // Apply custom styles
                    />
                )}
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={gender}
                        style={styles.picker}
                        onValueChange={(itemValue) => setGender(itemValue)}
                    >
                        <Picker.Item label="Female" value="Female" />
                        <Picker.Item label="Male" value="Male" />
                    </Picker>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Country"
                    placeholderTextColor="#ccc"
                    value={country}
                    onChangeText={setCountry}
                />
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Bio"
                    placeholderTextColor="#ccc"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                />
                <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
    <LinearGradient
        colors={['#6a11cb', '#2575fc']}
        style={styles.buttonBackground}
    >
        <FontAwesome name="save" size={24} color="white" />
        <Text style={styles.buttonText}>Update Profile</Text>
    </LinearGradient>
</TouchableOpacity>
</ScrollView>
</LinearGradient>
);
};

const styles = StyleSheet.create({
container: {
    flex: 1,
},
scrollViewContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
textArea: {
    height: 100,
},
pickerContainer: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 10,
},
picker: {
    width: '100%',
    height: 50,
    color: '#fff', // Text color
},
datePicker: {
    backgroundColor: '#fff', // Background color for Android
    borderRadius: 5, // Rounded corners for Android
    padding: 10, // Padding for Android
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

export default UpdatePersonalInfoScreen;
