import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from './AuthContext';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
    const { user } = useContext(AuthContext); // Access the user from AuthContext
    const [rooms, setRooms] = useState([]);
    const [myRooms, setMyRooms] = useState([]);
    const [ownerRooms, setOwnerRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const res = await axios.get('http://192.168.172.192:5000/api/rooms');
                    setRooms(res.data);
                    if (user) {
                        setMyRooms(res.data.filter(room => room.creator._id === user._id));
                        setOwnerRooms(res.data.filter(room => room.owner._id === user._id));
                    }
                } catch (err) {
                    console.error('Error fetching rooms:', err.response ? err.response.data : err.message);
                }
            }
        };
        fetchRooms();
    }, [user]);

    const createRoom = async (name, isPrivate) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.post('http://192.168.172.192:5000/api/rooms/create', { name, isPrivate });
                setRooms([...rooms, res.data]);
                if (user) {
                    setMyRooms([...myRooms, res.data]);
                    setOwnerRooms([...ownerRooms, res.data]);
                }
                return res.data; // Return the created room
            } catch (err) {
                console.error('Error creating room:', err.response ? err.response.data : err.message);
                throw err;
            }
        }
    };

    const fetchUsersInRoom = async (roomId) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.get(`http://192.168.172.192:5000/api/rooms/${roomId}/users`);
                return res.data;
            } catch (err) {
                console.error('Error fetching users in room:', err.response ? err.response.data : err.message);
                throw err;
            }
        }
    };

    const inviteUser = async (roomId, userId) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.post('http://192.168.172.192:5000/api/rooms/invite', { roomId, userId });
                setRooms(rooms.map(room => room.roomId === roomId ? res.data : room));
            } catch (err) {
                console.error('Error inviting user:', err.response ? err.response.data : err.message);
            }
        }
    };

    const acceptInvitation = async (roomId) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.put(`http://192.168.172.192:5000/api/rooms/accept-invitation/${roomId}`);
                setRooms(rooms.map(room => room.roomId === roomId ? res.data : room));
            } catch (err) {
                console.error('Error accepting invitation:', err.response ? err.response.data : err.message);
            }
        }
    };

    const rejectInvitation = async (roomId) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.put(`http://192.168.172.192:5000/api/rooms/reject-invitation/${roomId}`);
                setRooms(rooms.map(room => room.roomId === roomId ? res.data : room));
            } catch (err) {
                console.error('Error rejecting invitation:', err.response ? err.response.data : err.message);
            }
        }
    };

    const changeOwnership = async (roomId, newOwnerId) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.put(`http://192.168.172.192:5000/api/rooms/change-ownership/${roomId}`, { newOwnerId });
                setRooms(rooms.map(room => room.roomId === roomId ? res.data : room));
                setOwnerRooms(ownerRooms.map(room => room.roomId === roomId ? res.data : room));
            } catch (err) {
                console.error('Error changing ownership:', err.response ? err.response.data : err.message);
            }
        }
    };

    const setReadOnly = async (roomId, userId) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.put(`http://192.168.172.192:5000/api/rooms/set-read-only/${roomId}`, { userId });
                setRooms(rooms.map(room => room.roomId === roomId ? res.data : room));
            } catch (err) {
                console.error('Error setting read-only:', err.response ? err.response.data : err.message);
            }
        }
    };

    const removeReadOnly = async (roomId, userId) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.put(`http://192.168.172.192:5000/api/rooms/remove-read-only/${roomId}`, { userId });
                setRooms(rooms.map(room => room.roomId === roomId ? res.data : room));
            } catch (err) {
                console.error('Error removing read-only:', err.response ? err.response.data : err.message);
            }
        }
    };

    const deleteRoom = async (roomId) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                await axios.delete(`http://192.168.172.192:5000/api/rooms/${roomId}`);
                setRooms(rooms.filter(room => room.roomId !== roomId));
                setMyRooms(myRooms.filter(room => room.roomId !== roomId));
                setOwnerRooms(ownerRooms.filter(room => room.roomId !== roomId));
            } catch (err) {
                console.error('Error deleting room:', err.response ? err.response.data : err.message);
            }
        }
    };

    const changeRoomPrivacy = async (roomId, isPrivate) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.put(`http://192.168.172.192:5000/api/rooms/change-privacy/${roomId}`, { isPrivate });
                setRooms(rooms.map(room => room.roomId === roomId ? res.data : room));
                return res.data;
            } catch (err) {
                console.error('Error changing room privacy:', err.response ? err.response.data : err.message);
                throw err;
            }
        }
    };

    const changeRoomColor = async (roomId, backgroundColor) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await axios.put(`http://192.168.172.192:5000/api/rooms/change-color/${roomId}`, { backgroundColor });
                setRooms(rooms.map(room => room.roomId === roomId ? res.data : room));
                return res.data;
            } catch (err) {
                console.error('Error changing room color:', err.response ? err.response.data : err.message);
                throw err;
            }
        }
    };
    

    const updateRoomPrivacy = (roomId, isPrivate) => {
        setRooms(rooms.map(room => room.roomId === roomId ? { ...room, isPrivate } : room));
    };

    const updateRoomColor = (roomId, backgroundColor) => {
        setRooms(rooms.map(room => room.roomId === roomId ? { ...room, backgroundColor } : room));
    };

    return (
        <RoomContext.Provider value={{
            rooms,
            myRooms,
            ownerRooms,
            createRoom,
            fetchUsersInRoom,
            inviteUser,
            acceptInvitation,
            rejectInvitation,
            changeOwnership,
            setReadOnly,
            removeReadOnly,
            deleteRoom,
            changeRoomPrivacy,
            changeRoomColor,
            updateRoomPrivacy,
            updateRoomColor
        }}>
            {children}
        </RoomContext.Provider>
    );
};

export default RoomContext;
