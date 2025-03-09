import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import RoomContext from '../context/RoomContext';
import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

const CreateRoomScreen = ({ navigation }) => {
    const { createRoom } = useContext(RoomContext);
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false); // Add alertVisible state
    const [alertTitle, setAlertTitle] = useState(''); // Add alertTitle state
    const [alertMessage, setAlertMessage] = useState(''); // Add alertMessage state
    const [alertType, setAlertType] = useState(''); // Add alertType state

    const handleCreateRoom = async () => {
        if (!name.trim()) {
            setAlertTitle('Error');
            setAlertMessage('Room name is required');
            setAlertType('error'); // Set alert type to error
            setAlertVisible(true);
            return;
        }
        try {
            const room = await createRoom(name, isPrivate);
            setAlertTitle('Success');
            setAlertMessage('Room created successfully');
            setAlertType('success'); // Set alert type to success
            setAlertVisible(true);
            navigation.navigate('Chat', { roomId: room.roomId }); // Redirect to the chat screen of the created room
        } catch (err) {
            console.error('Error creating room:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setAlertTitle('Error');
                setAlertMessage(err.response.data.error);
                setAlertType('error'); // Set alert type to error
            } else {
                setAlertTitle('Error');
                setAlertMessage('Error creating room');
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
            <Text style={styles.title}>Create Room</Text>
            <TextInput
                style={styles.input}
                placeholder="Room Name"
                placeholderTextColor="#ccc"
                value={name}
                onChangeText={setName}
            />
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setIsPrivate(!isPrivate)}>
                <FontAwesome name={isPrivate ? "check-square" : "square"} size={24} color="white" />
                <Text style={styles.checkboxLabel}>Private Room</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleCreateRoom}>
                <LinearGradient
                    colors={['#6a11cb', '#2575fc']}
                    style={styles.buttonBackground}
                >
                    <Text style={styles.buttonText}>Create Room</Text>
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
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#fff', // Make the input text white for better contrast
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: '#fff', // Make the checkbox label text white for better contrast
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
});

export default CreateRoomScreen;
