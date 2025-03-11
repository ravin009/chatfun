import React, { useContext, useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Animated, PanResponder, Alert, TextInput } from 'react-native';
import RoomContext from '../context/RoomContext';
import AuthContext from '../context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import Avatar from './Avatar';
import axios from 'axios';
import ColorInputModal from './ColorInputModal';

const RoomSettings = ({ room, visible, onClose }) => {
    const { user, isAdmin } = useContext(AuthContext);
    const { changeOwnership, deleteRoom, changeRoomPrivacy, changeRoomColor, setReadOnly, removeReadOnly, fetchUsersInRoom, updateRoomPrivacy, updateRoomColor } = useContext(RoomContext);
    const [showColorModal, setShowColorModal] = useState(false);
    const [backgroundColor, setBackgroundColor] = useState(room?.backgroundColor || '#ffffff');
    const [showUserList, setShowUserList] = useState(false);
    const [usersInRoom, setUsersInRoom] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [readOnlyListVisible, setReadOnlyListVisible] = useState(false);
    const [readOnlyUsersDetails, setReadOnlyUsersDetails] = useState([]);
    const pan = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => {
            // Do nothing on release to keep the box where it was dragged
        },
    }), [pan]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (room) {
                const users = await fetchUsersInRoom(room.roomId);
                setUsersInRoom(users);
            }
        };
        fetchUsers();
    }, [room]);

    useEffect(() => {
        const fetchReadOnlyUsersDetails = async () => {
            const details = await Promise.all(room.readOnlyUsers.map(userId => fetchUserDetails(userId)));
            setReadOnlyUsersDetails(details);
        };
        if (room) {
            fetchReadOnlyUsersDetails();
        }
    }, [room]);

    const fetchUserDetails = async (userId) => {
        try {
            const res = await axios.get(`https://chatfun-backend.onrender.com/api/user/${userId}`);
            return res.data;
        } catch (err) {
            console.error('Error fetching user details:', err);
            return null;
        }
    };

    const getUserDetails = async (userId) => {
        let user = usersInRoom.find(u => u._id === userId);
        if (!user) {
            user = await fetchUserDetails(userId);
            if (user) {
                setUsersInRoom(prevUsers => [...prevUsers, user]);
            }
        }
        return user;
    };

    if (!room || !user) return null;

    const isOwnerOrCreator = room.owner._id === user._id || room.creator._id === user._id;
    const isCreator = room.creator._id === user._id;

    const handleChangeOwnership = async () => {
        if (!selectedUserId) {
            Alert.alert('Error', 'Please select a user to transfer ownership.');
            return;
        }
        Alert.alert(
            'Change Ownership',
            'Are you sure you want to change the owner of this room?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Ownership change cancelled'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await changeOwnership(room.roomId, selectedUserId);
                            Alert.alert('Success', 'Ownership changed successfully');
                            setShowUserList(false);
                        } catch (err) {
                            console.error('Error changing ownership:', err);
                            Alert.alert('Error', 'Error changing ownership');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleDeleteRoom = async () => {
        Alert.alert(
            'Delete Room',
            'Are you sure you want to delete this room?',
            [
                {
                    text: 'No',
                    onPress: () => console.log('Room deletion cancelled'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await deleteRoom(room.roomId);
                            Alert.alert('Success', 'Room deleted successfully');
                            onClose();
                        } catch (err) {
                            console.error('Error deleting room:', err);
                            Alert.alert('Error', 'Error deleting room');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleChangeRoomPrivacy = async () => {
        Alert.alert(
            'Change Room Privacy',
            `Are you sure you want to make this room ${room.isPrivate ? 'public' : 'private'}?`,
            [
                {
                    text: 'No',
                    onPress: () => console.log('Room privacy change cancelled'),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            const updatedRoom = await changeRoomPrivacy(room.roomId, !room.isPrivate);
                            updateRoomPrivacy(room.roomId, updatedRoom.isPrivate); // Update the room privacy in the context
                            Alert.alert('Success', `Room is now ${updatedRoom.isPrivate ? 'Private' : 'Public'}`);
                            onClose();
                        } catch (err) {
                            console.error('Error changing room privacy:', err);
                            Alert.alert('Error', 'Error changing room privacy');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleChangeRoomColor = async (color) => {
        try {
            await changeRoomColor(room.roomId, color);
            updateRoomColor(room.roomId, color); // Update the room color in the context
            Alert.alert('Success', 'Room color changed successfully');
            onClose();
        } catch (err) {
            console.error('Error changing room color:', err);
            Alert.alert('Error', 'Error changing room color');
        }
    };

    const handleSetReadOnly = async (userId) => {
        try {
            await setReadOnly(room.roomId, userId);
            Alert.alert('Success', 'User set to read-only mode');
        } catch (err) {
            console.error('Error setting read-only:', err);
            Alert.alert('Error', 'Error setting read-only');
        }
    };

    const handleRemoveReadOnly = async (userId) => {
        try {
            await removeReadOnly(room.roomId, userId);
            Alert.alert('Success', 'User removed from read-only mode');
        } catch (err) {
            console.error('Error removing read-only:', err);
            Alert.alert('Error', 'Error removing read-only');
        }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalContent}>
                    <Text style={styles.title}>Room Settings</Text>
                    <View style={styles.roomInfoContainer}>
                        <Text style={styles.roomInfoText}>Room Name: {room.name}</Text>
                        <Text style={styles.roomInfoText}>Room ID: {room.roomId}</Text>
                        <Text style={styles.roomInfoText}>Creator: {room.creator.nickname} (UUID: {room.creator.uuid})</Text>
                        <Text style={styles.roomInfoText}>Owner: {room.owner.nickname} (UUID: {room.owner.uuid})</Text>
                    </View>
                    {(isOwnerOrCreator || isAdmin) && (
                        <>
                            <TouchableOpacity style={styles.menuItem} onPress={() => setShowUserList(true)}>
                                <FontAwesome name="user" size={24} color="#007bff" />
                                <Text style={styles.menuText}>Change Ownership</Text>
                            </TouchableOpacity>
                            {(isCreator || isAdmin) && (
                                <TouchableOpacity style={styles.menuItem} onPress={handleDeleteRoom}>
                                    <FontAwesome name="trash" size={24} color="#ff4d4d" />
                                    <Text style={styles.menuText}>Delete Room</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.menuItem} onPress={handleChangeRoomPrivacy}>
                                <FontAwesome name={room.isPrivate ? "unlock" : "lock"} size={24} color="#ffcc00" />
                                <Text style={styles.menuText}>{room.isPrivate ? 'Make Public' : 'Make Private'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => setShowColorModal(true)}>
                                <FontAwesome name="paint-brush" size={24} color="#8e44ad" />
                                <Text style={styles.menuText}>Change Room Color</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => setReadOnlyListVisible(true)}>
                                <FontAwesome name="list" size={24} color="#ff6347" />
                                <Text style={styles.menuText}>Read-Only List</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </ScrollView>
                <Modal visible={showUserList} transparent={true} animationType="slide" onRequestClose={() => setShowUserList(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.userListModalContent}>
                            <Text style={styles.title}>Select New Owner</Text>
                            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                                {usersInRoom.map(user => (
                                    <TouchableOpacity key={user._id} style={styles.userItem} onPress={() => setSelectedUserId(user._id)}>
                                        <Avatar avatarPath={user.avatar} />
                                        <Text style={styles.userNickname}>{user.nickname}</Text>
                                        {selectedUserId === user._id && <FontAwesome name="check" size={24} color="green" />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity style={styles.saveColorButton} onPress={handleChangeOwnership}>
                                <Text style={styles.buttonText}>Change Ownership</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowUserList(false)}>
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal visible={readOnlyListVisible} transparent={true} animationType="slide" onRequestClose={() => setReadOnlyListVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.userListModalContent}>
                            <Text style={styles.title}>Read-Only List</Text>
                            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                                {readOnlyUsersDetails.map(user => (
                                    <View key={user._id} style={styles.userItem}>
                                        <Avatar avatarPath={user.avatar} />
                                        <Text style={styles.userNickname}>{user.nickname}</Text>
                                        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveReadOnly(user._id)}>
                                            <FontAwesome name="times" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setReadOnlyListVisible(false)}>
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <ColorInputModal
                    visible={showColorModal}
                    onClose={() => setShowColorModal(false)}
                    onSave={handleChangeRoomColor}
                    initialColor={backgroundColor}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    userListModalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    roomInfoContainer: {
        width: '100%',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#3c4368',
        borderRadius: 10,
        alignItems: 'center'
    },
    roomInfoText: {
        fontSize: 14,
        marginBottom: 5,
        color: 'rgb(240, 240, 240)',
        fontWeight: 'bold',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginVertical: 5,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    menuText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    colorInputContainer: {
        width: '100%',
        marginTop: 20,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    saveColorButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButton: {
        backgroundColor: '#6c757d',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    scrollViewContent: {
        flexGrow: 1,
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
    },
    removeButton: {
        backgroundColor: '#ff4d4d',
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
    },
});

export default RoomSettings;
