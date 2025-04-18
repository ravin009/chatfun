import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { View, FlatList, TouchableOpacity, Animated, PanResponder, Modal, Text, BackHandler, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import RoomContext from '../context/RoomContext';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/ChatScreenStyles';
import MessageItem from '../components/MessageItem';
import MessageInput from '../components/MessageInput';
import UserOptionsModal from '../components/UserOptionsModal';
import ProfileViewModal from '../components/ProfileViewModal';
import PrivateMessageBox from '../components/PrivateMessageBox';
import PrivateMessageNotification from '../components/PrivateMessageNotification';
import RoomSettings from '../components/RoomSettings';
import TopNavigationBar from '../components/TopNavigationBar';
import MenuScreen from './MenuScreen';
import ExitConfirmationBox from '../components/ExitConfirmationBox'; // Import the new component

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ navigation, route }) => {
    const { roomId } = route.params || {};
    const [messages, setMessages] = useState([]);
    const { user, setUser, logout, addFriend, removeFriend, blockUser, unblockUser, isFriend, isBlocked, sendPrivateMessage, getPrivateMessages, markAsRead, unreadMessages, setUnreadMessages, isAdmin, setAlertTitle, setAlertMessage, setAlertType, setAlertVisible, setAlertOnConfirm, setAlertOnCancel } = useContext(AuthContext);
    const { rooms, setReadOnly, removeReadOnly } = useContext(RoomContext);
    const socket = useRef(null);
    const [userOptionsVisible, setUserOptionsVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserProfile, setSelectedUserProfile] = useState(null); // Add this line
    const [profileViewVisible, setProfileViewVisible] = useState(false);
    const [privateMessageBoxVisible, setPrivateMessageBoxVisible] = useState(false);
    const [privateMessageRecipient, setPrivateMessageRecipient] = useState(null);
    const [privateMessageRecipientGender, setPrivateMessageRecipientGender] = useState(null);
    const [privateMessageRecipientNickname, setPrivateMessageRecipientNickname] = useState(null);
    const [privateMessages, setPrivateMessages] = useState([]);
    const [privateMessageNotification, setPrivateMessageNotification] = useState(null);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [infoVisible, setInfoVisible] = useState(false);
    const [showNavBar, setShowNavBar] = useState(true);
    const [userCounts, setUserCounts] = useState({ maleCount: 0, femaleCount: 0 });
    const [menuVisible, setMenuVisible] = useState(false);
    const pan = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];
    const menuPan = useState(new Animated.ValueXY({ x: width, y: 0 }))[0];
    const flatListRef = useRef();
    const [defaultRoomId, setDefaultRoomId] = useState(null);
    const [exitConfirmationVisible, setExitConfirmationVisible] = useState(false); // Add this line

    const room = rooms.find(r => r.roomId === roomId);

    useEffect(() => {
        const fetchDefaultRoomId = async () => {
            try {
                const res = await axios.get('https://chatfun-backend.onrender.com/api/default-room');
                setDefaultRoomId(res.data.roomId);
            } catch (err) {
                console.error('Error fetching default room ID:', err.response ? err.response.data : err.message);
                setAlertTitle('Error');
                setAlertMessage('Default room not found. Please contact support.');
                setAlertType('error');
                setAlertVisible(true);
            }
        };

        fetchDefaultRoomId();
    }, []);

    useEffect(() => {
        if (user && (roomId || defaultRoomId)) {
            socket.current = io('https://chatfun-backend.onrender.com');
            socket.current.on('connect', () => {
                console.log('Socket connected');
                socket.current.emit('userOnline', user._id);
                socket.current.emit('joinRoom', { userId: user._id, roomId: roomId || defaultRoomId });
            });

            socket.current.on('message', (message) => {
                console.log('Received message:', message);
                setMessages((prevMessages) => {
                    // Check if the message already exists in the state
                    const messageExists = prevMessages.some(msg => msg._id === message._id);
                    if (messageExists) {
                        return prevMessages;
                    }
                    const newMessages = [...prevMessages, message];
                    console.log('Updated messages state:', newMessages);
                    return newMessages.length > 70 ? newMessages.slice(newMessages.length - 70) : newMessages;
                });
                flatListRef.current.scrollToEnd({ animated: true });
            });

            socket.current.on('privateMessage', async (message) => {
                console.log('Received private message:', message);
                if (!message.senderId || typeof message.senderId === 'string') {
                    const senderRes = await axios.get(`https://chatfun-backend.onrender.com/api/user/${message.senderId}`);
                    message.senderId = senderRes.data;
                }
                setPrivateMessages((prevMessages) => [...prevMessages, message]);
                if (message.recipientId === user._id && !message.isRead) {
                    setUnreadMessages((prevUnread) => [...prevUnread, message]);
                    setPrivateMessageNotification(message);
                }
            });

            socket.current.on('privateMessageNotification', async (message) => {
                console.log('Received private message notification:', message);
                if (!message.senderId || typeof message.senderId === 'string') {
                    const senderRes = await axios.get(`https://chatfun-backend.onrender.com/api/user/${message.senderId}`);
                    message.senderId = senderRes.data;
                }
                if (message.recipientId === user._id && !message.isRead) {
                    setUnreadMessages((prevUnread) => [...prevUnread, message]);
                    setPrivateMessageNotification(message);
                }
            });

            socket.current.on('userStatusChanged', (status) => {
                console.log('User status changed:', status);
                setMessages((prevMessages) => prevMessages.map((msg) => {
                    if (msg.userId._id === status.userId) {
                        return { ...msg, userId: { ...msg.userId, isOnline: status.isOnline } };
                    }
                    return msg;
                }));
            });

            socket.current.on('userCounts', ({ roomId, maleCount, femaleCount }) => {
                if (roomId === room?.roomId) {
                    setUserCounts({ maleCount, femaleCount });
                }
            });

            return () => {
                console.log('Cleaning up socket listeners');
                socket.current.disconnect();
            };
        }
    }, [user, roomId, defaultRoomId]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const res = await axios.get(`https://chatfun-backend.onrender.com/api/chat/${roomId || defaultRoomId}`);
                    const fetchedMessages = res.data;

                    const filteredMessages = user ? fetchedMessages.filter(chat => chat.userId && !user.blockedUsers.includes(chat.userId._id)) : fetchedMessages;

                    console.log('Fetched messages:', filteredMessages);
                    setMessages(filteredMessages.length > 70 ? filteredMessages.slice(filteredMessages.length - 70) : filteredMessages);
                    flatListRef.current.scrollToEnd({ animated: false }); // Scroll to the bottom without animation
                } else {
                    console.error('No token found');
                }
            } catch (err) {
                console.error('Error fetching messages:', err.response ? err.response.data : err.message);
            }
        };
        if (user && defaultRoomId) {
            fetchMessages();
        }
    }, [user, roomId, defaultRoomId]);

    const sendMessage = useCallback(
        debounce(async (message) => {
            if (message.trim()) {
                const tempId = Date.now().toString(); // Temporary ID for the message
                const newMessage = { _id: tempId, roomId: roomId || defaultRoomId, message, userId: user._id, nickname: user.nickname, avatar: user.avatar, nicknameColor: user.nicknameColor, chatTextColor: user.chatTextColor };

                // Update the state immediately
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                flatListRef.current.scrollToEnd({ animated: true });

                try {
                    const roomRes = await axios.get(`https://chatfun-backend.onrender.com/api/rooms/${newMessage.roomId}`);
                    if (!roomRes.data) {
                        throw new Error('Room not found');
                    }

                    if (roomRes.data.readOnlyUsers.includes(user._id)) {
                        setAlertTitle('Read-Only Mode');
                        setAlertMessage('You are in read-only mode and cannot send messages in this room.');
                        setAlertType('error');
                        setAlertVisible(true);
                        return;
                    }

                    const res = await axios.post('https://chatfun-backend.onrender.com/api/chat/send', newMessage);
                    console.log('Message sent:', res.data);
                    socket.current.emit('message', res.data);

                    // Replace the temporary message with the one from the server
                    setMessages((prevMessages) => prevMessages.map(msg => msg._id === tempId ? res.data : msg));

                    // Increment the rating only once
                    const ratingRes = await axios.put('https://chatfun-backend.onrender.com/api/user/increment-rating');
                    setUser((prevUser) => ({ ...prevUser, rating: ratingRes.data.rating }));
                } catch (err) {
                    console.error('Error sending message:', err.response ? err.response.data : err.message);
                    if (err.message === 'Room not found' || (err.response && err.response.data && err.response.data.error === 'Room not found')) {
                        setAlertTitle('Error');
                        setAlertMessage('The room you are trying to send a message to does not exist.');
                        setAlertType('error');
                        setAlertVisible(true);
                        navigation.navigate('Chat', { roomId: defaultRoomId });
                    } else if (err.response && err.response.data && err.response.data.error === 'You are banned from sending messages.') {
                        setAlertTitle('Banned');
                        setAlertMessage('You are banned from sending messages.');
                        setAlertType('error');
                        setAlertVisible(true);
                    }
                }
            }
        }, 300),
        [user, socket, setUser, roomId, defaultRoomId]
    );

    const sendImage = useCallback(
        debounce(async (imageUri) => {
            if (imageUri) {
                const formData = new FormData();
                const uriParts = imageUri.split('.');
                const fileType = uriParts[uriParts.length - 1];
                formData.append('image', {
                    uri: imageUri,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                });
                formData.append('roomId', roomId || defaultRoomId);
                formData.append('userId', user._id);
                formData.append('nickname', user.nickname);
                formData.append('avatar', user.avatar);
                formData.append('nicknameColor', user.nicknameColor);
                formData.append('chatTextColor', user.chatTextColor);

                try {
                    // Check if the user is banned
                    const userRes = await axios.get(`https://chatfun-backend.onrender.com/api/user/${user._id}`);
                    if (userRes.data.isBanned) {
                        setAlertTitle('Banned');
                        setAlertMessage('You are banned from sending messages.');
                        setAlertType('error');
                        setAlertVisible(true);
                        return;
                    }

                    const roomRes = await axios.get(`https://chatfun-backend.onrender.com/api/rooms/${roomId || defaultRoomId}`);
                    if (!roomRes.data) {
                        throw new Error('Room not found');
                    }

                    if (roomRes.data.readOnlyUsers.includes(user._id)) {
                        setAlertTitle('Read-Only Mode');
                        setAlertMessage('You are in read-only mode and cannot send messages in this room.');
                        setAlertType('error');
                        setAlertVisible(true);
                        return;
                    }

                    const res = await axios.post('https://chatfun-backend.onrender.com/api/chat/send-image', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    const imageMessage = { roomId: roomId || defaultRoomId, message: res.data.fileName, userId: user._id, nickname: user.nickname, avatar: user.avatar, nicknameColor: user.nicknameColor, chatTextColor: user.chatTextColor };
                    console.log('Image sent:', imageMessage);
                    socket.current.emit('message', imageMessage);
                    flatListRef.current.scrollToEnd({ animated: true });

                    try {
                        const ratingRes = await axios.put('https://chatfun-backend.onrender.com/api/user/increment-rating');
                        setUser((prevUser) => ({ ...prevUser, rating: ratingRes.data.rating }));
                    } catch (err) {
                        console.error('Error incrementing rating:', err.response ? err.response.data : err.message);
                    }
                } catch (err) {
                    console.error('Error sending image:', err.response ? err.response.data : err.message);
                    if (err.message === 'Room not found' || (err.response && err.response.data && err.response.data.error === 'Room not found')) {
                        setAlertTitle('Error');
                        setAlertMessage('The room you are trying to send an image to does not exist.');
                        setAlertType('error');
                        setAlertVisible(true);
                        navigation.navigate('Chat', { roomId: defaultRoomId });
                    } else if (err.response && err.response.data && err.response.data.error === 'You are banned from sending messages.') {
                        setAlertTitle('Banned');
                        setAlertMessage('You are banned from sending messages.');
                        setAlertType('error');
                        setAlertVisible(true);
                    } else if (err.response && err.response.data && err.response.data.error === 'You are in read-only mode and cannot send messages in this room.') {
                        setAlertTitle('Read-Only Mode');
                        setAlertMessage('You are in read-only mode and cannot send messages in this room.');
                        setAlertType('error');
                        setAlertVisible(true);
                    }
                }
            }
        }, 300),
        [user, socket, setUser, roomId, defaultRoomId]
    );

    useEffect(() => {
        console.log('Current user in ChatScreen:', user);
    }, [user]);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gestureState) => {
            if (gestureState.dy > 50) {
                setShowNavBar(true);
            }
        },
    }), [pan, setShowNavBar]);

    const menuPanResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: menuPan.x }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gestureState) => {
            if (gestureState.dx > 50) {
                Animated.timing(menuPan, {
                    toValue: { x: width, y: 0 },
                    duration: 300,
                    useNativeDriver: false,
                }).start(() => setMenuVisible(false));
            } else {
                Animated.spring(menuPan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            }
        },
    }), [menuPan]);

    const handleAddFriend = useCallback(async (friendId) => {
        if (typeof friendId !== 'string') {
            console.error('Invalid friendId:', friendId);
            return;
        }
        try {
            console.log('User before adding friend:', user);
            const res = await axios.put(`https://chatfun-backend.onrender.com/api/user/add-friend/${friendId}`);
            setUser((prevUser) => ({
                ...prevUser,
                friends: [...prevUser.friends, res.data.friends.find(friend => friend._id === friendId)]
            }));
            setAlertTitle('Success');
            setAlertMessage('You have added a friend successfully.');
            setAlertType('success');
            setAlertVisible(true);
            console.log('User after adding friend:', user);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error in handleAddFriend:', err);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while adding a friend.');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, [user]);

    const handleRemoveFriend = useCallback(async (friendId) => {
        if (typeof friendId !== 'string') {
            console.error('Invalid friendId:', friendId);
            return;
        }
        try {
            console.log('User before removing friend:', user);
            const res = await axios.put(`https://chatfun-backend.onrender.com/api/user/remove-friend/${friendId}`);
            setUser((prevUser) => ({
                ...prevUser,
                friends: prevUser.friends.filter(friend => friend._id !== friendId)
            }));
            setAlertTitle('Success');
            setAlertMessage('You have removed a friend successfully.');
            setAlertType('success');
            setAlertVisible(true);
            console.log('User after removing friend:', user);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error in handleRemoveFriend:', err);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while removing a friend.');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, [user]);

    const handleBlockUser = useCallback(async (blockedUserId) => {
        if (typeof blockedUserId !== 'string') {
            console.error('Invalid blockedUserId:', blockedUserId);
            return;
        }
        try {
            console.log('User before blocking user:', user);
            const res = await axios.put(`https://chatfun-backend.onrender.com/api/user/block-user/${blockedUserId}`);
            setUser((prevUser) => ({
                ...prevUser,
                blockedUsers: [...prevUser.blockedUsers, res.data.blockedUsers.find(blockedUser => blockedUser._id === blockedUserId)]
            }));
            setAlertTitle('Success');
            setAlertMessage('You have blocked the user successfully.');
            setAlertType('success');
            setAlertVisible(true);
            console.log('User after blocking user:', user);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error in handleBlockUser:', err);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while blocking a user.');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, [user]);

    const handleUnblockUser = useCallback(async (blockedUserId) => {
        if (typeof blockedUserId !== 'string') {
            console.error('Invalid blockedUserId:', blockedUserId);
            return;
        }
        try {
            console.log('User before unblocking user:', user);
            const res = await axios.put(`https://chatfun-backend.onrender.com/api/user/unblock-user/${blockedUserId}`);
            setUser((prevUser) => ({
                ...prevUser,
                blockedUsers: prevUser.blockedUsers.filter(blockedUser => blockedUser._id !== blockedUserId)
            }));
            setAlertTitle('Success');
            setAlertMessage('You have unblocked the user successfully.');
            setAlertType('success');
            setAlertVisible(true);
            console.log('User after unblocking user:', user);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error in handleUnblockUser:', err);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while unblocking a user.');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, [user]);

    const handleSetReadOnly = useCallback(async (userId) => {
        try {
            await setReadOnly(roomId, userId);
            setAlertTitle('Success');
            setAlertMessage('User set to read-only mode');
            setAlertType('success');
            setAlertVisible(true);
        } catch (err) {
            console.error('Error setting read-only:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage(err.response ? err.response.data.error : 'An error occurred while setting read-only mode');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, [roomId, setReadOnly]);

    const handleRemoveReadOnly = useCallback(async (userId) => {
        try {
            await removeReadOnly(roomId, userId);
            setAlertTitle('Success');
            setAlertMessage('User removed from read-only mode');
            setAlertType('success');
            setAlertVisible(true);
        } catch (err) {
            console.error('Error removing read-only:', err);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while removing read-only mode');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, [roomId, removeReadOnly]);

    const handleBanUser = useCallback(async (userId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put('https://chatfun-backend.onrender.com/api/user/ban-user', { userId });
            setAlertTitle('Success');
            setAlertMessage('User banned successfully.');
            setAlertType('success');
            setAlertVisible(true);
            setSelectedUserProfile((prevProfile) => ({ ...prevProfile, isBanned: true })); // Update the state
            return res.data;
        } catch (err) {
            console.error('Error in handleBanUser:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage(err.response && err.response.data && err.response.data.error ? err.response.data.error : 'An error occurred while banning the user.');
            setAlertType('error');
            setAlertVisible(true);
            throw err;
        }
    }, []);

    const handleUnbanUser = useCallback(async (userId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put('https://chatfun-backend.onrender.com/api/user/unban-user', { userId });
            setAlertTitle('Success');
            setAlertMessage('User unbanned successfully.');
            setAlertType('success');
            setAlertVisible(true);
            setSelectedUserProfile((prevProfile) => ({ ...prevProfile, isBanned: false })); // Update the state
            return res.data;
        } catch (err) {
            console.error('Error in handleUnbanUser:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage(err.response && err.response.data && err.response.data.error ? err.response.data.error : 'An error occurred while unbanning the user.');
            setAlertType('error');
            setAlertVisible(true);
            throw err;
        }
    }, []);

    const handleSetRole = async (userId, role, action) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put('https://chatfun-backend.onrender.com/api/admin/set-role', { userId, role, action });
            setAlertTitle('Success');
            setAlertMessage(`Role ${action === 'add' ? 'added to' : 'removed from'} user.`);
            setAlertType('success');
            setAlertVisible(true);
            setSelectedUserProfile((prevProfile) => {
                const updatedRoles = action === 'add' ? [...prevProfile.roles, role] : prevProfile.roles.filter(r => r !== role);
                return { ...prevProfile, roles: updatedRoles };
            });
        } catch (err) {
            console.error('Error setting role:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while setting the role.');
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const renderUserOptions = useCallback(async (userId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.get(`https://chatfun-backend.onrender.com/api/user/${userId}`);
            setSelectedUserProfile(res.data);
            setSelectedUserId(userId);
            setUserOptionsVisible(true);
        } catch (err) {
            console.error('Error fetching user profile:', err);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while fetching the user profile.');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, []);

    const handleViewProfile = useCallback(async (userId) => {
        if (typeof userId !== 'string') {
            console.error('Invalid userId:', userId);
            return;
        }
        try {
            console.log('Fetching user profile for userId:', userId);
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.get(`https://chatfun-backend.onrender.com/api/user/${userId}`);
            setSelectedUserProfile(res.data);
            setProfileViewVisible(true);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error in handleViewProfile:', err);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while fetching the user profile.');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, [user]);

    const handlePrivateMessage = useCallback(async (userId) => {
        if (typeof userId !== 'string') {
            console.error('Invalid userId:', userId);
            return;
        }
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.get(`https://chatfun-backend.onrender.com/api/user/${userId}`);
            setPrivateMessageRecipient(userId);
            setPrivateMessageRecipientGender(res.data.gender);
            setPrivateMessageRecipientNickname(res.data.nickname);
            setPrivateMessageBoxVisible(true);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error in handlePrivateMessage:', err);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while initiating the private message.');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, [user]);

    const handleSendPrivateMessage = useCallback(async (message) => {
        if (message.trim() && privateMessageRecipient) {
            try {
                const res = await sendPrivateMessage(privateMessageRecipient, message);
                if (res) {
                    if (socket.current) {
                        socket.current.emit('privateMessage', res);
                        setAlertTitle('Message Sent');
                        setAlertMessage('Your message has been sent successfully.');
                        setAlertType('success');
                        setAlertVisible(true);
                        console.log('Message sent:', res);
                    } else {
                        console.error('Socket is undefined');
                    }
                }
            } catch (err) {
                console.error('Error in handleSendPrivateMessage:', err);
                setAlertTitle('Error');
                setAlertMessage('An error occurred while sending the private message.');
                setAlertType('error');
                setAlertVisible(true);
            }
        }
    }, [privateMessageRecipient, sendPrivateMessage, socket]);

    const handleMarkAsRead = useCallback(async (messageId) => {
        try {
            await markAsRead(messageId);
            setUnreadMessages((prevUnread) => prevUnread.filter(msg => msg._id !== messageId));
            setPrivateMessageNotification(null);
        } catch (err) {
            console.error('Error in handleMarkAsRead:', err);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while marking the message as read.');
            setAlertType('error');
            setAlertVisible(true);
        }
    }, [markAsRead]);

    const handleRoomInfo = () => {
        if (room && (room.owner._id === user._id || room.creator._id === user._id || isAdmin)) {
            setSettingsVisible(true);
        } else {
            setInfoVisible(true);
        }
    };

    const handleSwipeDown = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (e, gestureState) => {
            if (gestureState.dy > 50) {
                setShowNavBar(true);
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                    friction: 8,
                    tension: 40,
                }).start();
            } else if (gestureState.dy < -50) {
                setShowNavBar(false);
                Animated.spring(pan, {
                    toValue: { x: 0, y: -100 },
                    useNativeDriver: false,
                    friction: 8,
                    tension: 40,
                }).start();
            } else {
                Animated.spring(pan, {
                    toValue: showNavBar ? { x: 0, y: 0 } : { x: 0, y: -100 },
                    useNativeDriver: false,
                    friction: 8,
                    tension: 40,
                }).start();
            }
        },
    }), [pan, showNavBar, setShowNavBar]);

    const handleImageClick = (fileName) => {
        navigation.navigate('ImageView', { fileName });
    };

    const handleSendMessageFromProfile = (recipientId, recipientGender, recipientNickname) => {
        setPrivateMessageRecipient(recipientId);
        setPrivateMessageRecipientGender(recipientGender);
        setPrivateMessageRecipientNickname(recipientNickname);
        setPrivateMessageBoxVisible(true);
        setProfileViewVisible(false);
    };

    // Add the back button handler
    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                setExitConfirmationVisible(true);
                return true;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, [])
    );

    return (
        <View style={[styles.container, { backgroundColor: room?.backgroundColor || '#17202a' }]} {...handleSwipeDown.panHandlers}>
            {user && (
                <>
                    <TopNavigationBar
                        navigation={navigation}
                        handleRoomInfo={handleRoomInfo}
                        showNavBar={showNavBar}
                        setShowNavBar={setShowNavBar}
                        roomId={roomId || defaultRoomId}
                    />
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={({ item }) => {
                            console.log('Rendering message item:', item);
                            return <MessageItem item={item} renderUserOptions={renderUserOptions} handleImageClick={handleImageClick} />;
                        }}
                        keyExtractor={(item) => item._id ? item._id.toString() : Math.random().toString()} // Ensure each item has a unique key
                        onContentSizeChange={() => {
                            console.log('Content size changed, scrolling to end');
                            flatListRef.current.scrollToEnd({ animated: false }); // Scroll to the bottom without animation
                        }}
                        onLayout={() => {
                            console.log('Layout changed, scrolling to end');
                            flatListRef.current.scrollToEnd({ animated: false }); // Scroll to the bottom without animation
                        }}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={21}
                        extraData={messages}
                        style={styles.scrollView}
                    />
                    <MessageInput sendMessage={sendMessage} sendImage={sendImage} />
                    <TouchableOpacity style={styles.hamburgerIcon} onPress={() => {
                        setMenuVisible(true);
                        Animated.spring(menuPan, {
                            toValue: { x: 0, y: 0 },
                            useNativeDriver: false,
                        }).start();
                    }}>
                        <FontAwesome name="bars" size={24} color="green" />
                    </TouchableOpacity>
                    {menuVisible && (
                        <Animated.View
                            style={[styles.menuContainer, { transform: [{ translateX: menuPan.x }] }]}
                            {...menuPanResponder.panHandlers}
                        >
                            <MenuScreen navigation={navigation} />
                        </Animated.View>
                    )}
                    <UserOptionsModal
                        visible={userOptionsVisible}
                        onClose={() => setUserOptionsVisible(false)}
                        userId={selectedUserId}
                        isFriend={isFriend(selectedUserId)}
                        isBlocked={isBlocked(selectedUserId)}
                        isReadOnly={room?.readOnlyUsers.includes(selectedUserId)}
                        isBanned={selectedUserProfile?.isBanned} // Add this line
                        handleAddFriend={handleAddFriend}
                        handleRemoveFriend={handleRemoveFriend}
                        handleBlockUser={handleBlockUser}
                        handleUnblockUser={handleUnblockUser}
                        handleViewProfile={handleViewProfile}
                        handlePrivateMessage={handlePrivateMessage}
                        handleSetReadOnly={handleSetReadOnly}
                        handleRemoveReadOnly={handleRemoveReadOnly}
                        handleBanUser={handleBanUser} // Add this line
                        handleUnbanUser={handleUnbanUser} // Add this line
                        isAdmin={isAdmin}
                        handleSetRole={handleSetRole}
                        userRoles={selectedUserProfile?.roles || []}
                        currentUserRoles={user.roles || []}
                        isRoomOwner={room?.owner._id === user._id}
                        isRoomCreator={room?.creator._id === user._id}
                        currentRoomId={roomId || defaultRoomId}
                        targetUserRoomId={selectedUserProfile?.roomId}
                    />

                    <ProfileViewModal
                        visible={profileViewVisible}
                        onClose={() => setProfileViewVisible(false)}
                        userId={selectedUserId}
                        onSendMessage={handleSendMessageFromProfile}
                    />
                    <PrivateMessageBox
                        visible={privateMessageBoxVisible}
                        onClose={() => setPrivateMessageBoxVisible(false)}
                        onSend={handleSendPrivateMessage}
                        recipientId={privateMessageRecipient}
                        recipientGender={privateMessageRecipientGender}
                        recipientNickname={privateMessageRecipientNickname}
                    />
                    {privateMessageNotification && (
                        <PrivateMessageNotification
                            message={privateMessageNotification}
                            onClose={() => setPrivateMessageNotification(null)}
                            onReply={(senderId, senderGender, senderNickname) => {
                                console.log('Replying to:', senderId, senderGender, senderNickname);
                                setPrivateMessageRecipient(senderId);
                                setPrivateMessageRecipientGender(senderGender);
                                setPrivateMessageRecipientNickname(senderNickname);
                                setPrivateMessageBoxVisible(true);
                                setPrivateMessageNotification(null);
                            }}
                            onViewProfile={() => handleViewProfile(privateMessageNotification.senderId._id)}
                            onMarkAsRead={() => handleMarkAsRead(privateMessageNotification._id)}
                        />
                    )}
                    <Modal visible={infoVisible} transparent={true} animationType="slide" onRequestClose={() => setInfoVisible(false)}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Room Information</Text>
                                {room ? (
                                    <>
                                        <Text style={styles.modalText}>Room Name: {room.name}</Text>
                                        <Text style={styles.modalText}>Room ID: {room.roomId}</Text>
                                        <Text style={styles.modalText}>Creator: {room.creator.nickname} (UUID: {room.creator.uuid})</Text>
                                        <Text style={styles.modalText}>Owner: {room.owner.nickname} (UUID: {room.owner.uuid})</Text>
                                    </>
                                ) : (
                                    <Text style={styles.modalText}>Loading...</Text>
                                )}
                                <TouchableOpacity style={styles.closeButton} onPress={() => setInfoVisible(false)}>
                                    <Text style={styles.buttonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <RoomSettings
                        room={room}
                        visible={settingsVisible}
                        onClose={() => setSettingsVisible(false)}
                    />
                    <ExitConfirmationBox
                        visible={exitConfirmationVisible}
                        onConfirm={() => BackHandler.exitApp()}
                        onCancel={() => setExitConfirmationVisible(false)}
                    />
                </>
            )}
        </View>
    );
};

export default ChatScreen;
