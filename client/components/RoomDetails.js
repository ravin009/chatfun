import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import RoomContext from '../context/RoomContext';
import AuthContext from '../context/AuthContext';
import io from 'socket.io-client';
import Avatar from './Avatar';
import { LinearGradient } from 'expo-linear-gradient';

const RoomDetails = ({ route, navigation }) => {
    const { roomId } = route.params;
    const { rooms } = useContext(RoomContext);
    const { user } = useContext(AuthContext);
    const [room, setRoom] = useState(null);
    const [usersInRoom, setUsersInRoom] = useState([]);

    useEffect(() => {
        const roomDetails = rooms.find(r => r.roomId === roomId);
        setRoom(roomDetails);
    }, [rooms, roomId]);

    useEffect(() => {
        const socket = io('https://chatfun-backend.onrender.com');
        if (user && roomId) {
            socket.emit('joinRoom', { userId: user._id, roomId });

            socket.on('userList', ({ roomId: eventRoomId, users }) => {
                if (eventRoomId === roomId) {
                    setUsersInRoom(users.filter(u => u.isOnline && u.roomId === roomId));
                }
            });

            return () => {
                socket.emit('leaveRoom', { userId: user._id, roomId });
                socket.disconnect();
            };
        }
    }, [user, roomId]);

    if (!room || !user) {
        return null;
    }

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <View style={styles.detailsContainer}>
                <Text style={styles.title}>{room.name}</Text>
                <Text style={styles.subtitle}>Room ID: {room.roomId}</Text>
                <Text style={styles.subtitle}>Creator: {room.creator.nickname} (UUID: {room.creator.uuid})</Text>
                <Text style={styles.subtitle}>Owner: {room.owner.nickname} (UUID: {room.owner.uuid})</Text>
                <Text style={styles.subtitle}>Users in Room:</Text>
                <ScrollView style={styles.userList}>
                    {usersInRoom.length > 0 ? (
                        usersInRoom.map(user => (
                            <View key={user._id} style={styles.userItem}>
                                <Avatar avatarPath={user.avatar} />
                                <Text style={styles.userNickname}>{user.nickname}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyListText}>No users available.</Text>
                    )}
                </ScrollView>
            </View>
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
    detailsContainer: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 10,
        color: '#666',
        textAlign: 'center',
    },
    userList: {
        width: '100%',
        maxHeight: 200,
        marginTop: 10,
        marginBottom: 20,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    userNickname: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    emptyListText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default RoomDetails;
