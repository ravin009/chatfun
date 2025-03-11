import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Alert, TextInput } from 'react-native';
import RoomContext from '../context/RoomContext';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const boxWidth = (width - 80) / 3; // Adjust width for 3 boxes per row with some padding

const RoomList = ({ navigation }) => {
    const { rooms } = useContext(RoomContext);
    const [userCounts, setUserCounts] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredRooms, setFilteredRooms] = useState(rooms);

    useEffect(() => {
        const fetchUserCounts = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const counts = {};
                    for (const room of rooms) {
                        const res = await axios.get(`https://chatfun-backend.onrender.com/api/rooms/${room.roomId}/user-counts`);
                        counts[room.roomId] = res.data;
                    }
                    setUserCounts(counts);
                } catch (err) {
                    console.error('Error fetching user counts:', err.response ? err.response.data : err.message);
                }
            }
        };
        fetchUserCounts();
    }, [rooms]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredRooms(rooms);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = rooms.filter(room =>
                room.name.toLowerCase().includes(lowercasedQuery) ||
                room.roomId.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredRooms(filtered);
        }
    }, [searchQuery, rooms]);

    const handleRoomPress = async (roomId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.get(`https://chatfun-backend.onrender.com/api/rooms/${roomId}`);
            navigation.navigate('Chat', { roomId: res.data.roomId });
        } catch (err) {
            if (err.response && err.response.status === 403) {
                Alert.alert('Access Denied', 'You do not have access to this private room.');
            } else {
                console.error('Error accessing room:', err.response ? err.response.data : err.message);
                Alert.alert('Error', 'An error occurred while accessing the room.');
            }
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.roomItem}
            onPress={() => handleRoomPress(item.roomId)} // Handle room press
        >
            <View style={styles.roomHeader}>
                {item.isPrivate && <FontAwesome name="lock" size={16} color="red" style={styles.lockIcon} />}
                <Text style={styles.roomName}>{item.name}</Text>
            </View>
            <View style={styles.userCountContainer}>
                <Text style={styles.userCountText}>
                    <Text style={styles.femaleCount}>{userCounts[item.roomId]?.femaleCount || 0}</Text><Text style={{color: 'black'}}>/</Text>
                    <Text style={styles.maleCount}>{userCounts[item.roomId]?.maleCount || 0}</Text>
                </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('RoomDetails', { roomId: item.roomId })}>
                <FontAwesome name="info-circle" size={24} color="blue" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBox}
                placeholder="Search by Room Name or Room ID"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888"
            />
            <FlatList
                data={filteredRooms}
                renderItem={renderItem}
                keyExtractor={item => item.roomId}
                contentContainerStyle={styles.list}
                numColumns={3} // Display 3 boxes per row
                key={3} // Add key prop to force re-render when numColumns changes
                showsVerticalScrollIndicator={false} // Hide the vertical scrollbar
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingTop: 20, // Add padding to the top
        alignItems: 'center', // Center the content horizontally
    },
    searchBox: {
        width: '80%',
        alignSelf: 'center',
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 5, // Add margin to the bottom
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        textAlign: 'center', // Center the text
        fontSize: 16, // Increase font size
    },
    list: {
        padding: 10,
        alignItems: 'center', // Center the content horizontally
    },
    roomItem: {
        width: boxWidth,
        backgroundColor: '#f0f8ff', // Light background color for room items
        borderRadius: 10,
        padding: 15,
        margin: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        alignItems: 'center',
        transform: [{ translateY: -5 }],
        borderWidth: 1,
        borderColor: '#dcdcdc', // Light gray border color
    },
    roomHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    lockIcon: {
        marginRight: 5, // Add some space between the lock icon and the room name
    },
    roomName: {
        fontSize: 12, // Smaller font size for room name
        fontWeight: 'bold',
    },
    userCountContainer: {
        position: 'absolute',
        top: 0,
        right: 2,
        //backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 5,
        padding: 5,
    },
    userCountText: {
        fontSize: 10,
        color: 'white',
        fontWeight: 'bold'
    },
    femaleCount: {
        color: '#E0218A',
    },
    maleCount: {
        color: '#0b6bf6',
    },
});

export default RoomList;
