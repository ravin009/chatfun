import React, { createContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert, AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import io from 'socket.io-client';
import CustomAlert from '../components/CustomAlert';

const AuthContext = createContext();

const DEFAULT_AVATAR = 'https://placehold.co/40x40'; // Default avatar URL

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [currentPrivateChatUser, setCurrentPrivateChatUser] = useState(null);
    const navigation = useNavigation();
    const socket = useRef(io('https://chatfun-backend.onrender.com')).current;
    const [isAdmin, setIsAdmin] = useState(false);
    const [defaultRoomId, setDefaultRoomId] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const [alertOnConfirm, setAlertOnConfirm] = useState(null);
    const [alertOnCancel, setAlertOnCancel] = useState(null);

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
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                if (user) {
                    socket.emit('leaveRoom', { userId: user._id, roomId: defaultRoomId });
                    socket.emit('userOffline', user._id);
                }
            } else if (nextAppState === 'active') {
                if (user) {
                    socket.emit('joinRoom', { userId: user._id, roomId: defaultRoomId });
                    socket.emit('userOnline', user._id);
                    fetchUnreadMessages(user._id); // Fetch unread messages when the app becomes active
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [user, socket, defaultRoomId]);

    useEffect(() => {
        const loadUser = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const res = await axios.get('https://chatfun-backend.onrender.com/api/auth/me');
                    setUser({ ...res.data, avatar: res.data.avatar || DEFAULT_AVATAR });
                    setIsAdmin(res.data.roles.includes('Admin'));

                    // Emit userOnline event
                    socket.emit('userOnline', res.data._id);
                    socket.emit('joinRoom', { userId: res.data._id, roomId: defaultRoomId });

                    // Verify the default room exists
                    const roomRes = await axios.get(`https://chatfun-backend.onrender.com/api/rooms/${defaultRoomId}`);
                    if (roomRes.data) {
                        navigation.navigate('Chat', { roomId: defaultRoomId }); // Automatically redirect to default room
                    } else {
                        setAlertTitle('Error');
                        setAlertMessage('Default room not found.');
                        setAlertType('error');
                        setAlertVisible(true);
                    }

                    // Fetch unread messages
                    fetchUnreadMessages(res.data._id);
                } catch (err) {
                    console.error('Error loading user:', err.response ? err.response.data : err.message);
                    if (err.response && err.response.status === 401) {
                        await AsyncStorage.removeItem('token');
                        delete axios.defaults.headers.common['Authorization'];
                        setUser(null);
                        navigation.navigate('Login');
                    }
                }
            }
        };
        if (defaultRoomId) {
            loadUser();
        }
    }, [navigation, socket, defaultRoomId]);

    const fetchUnreadMessages = async (userId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.get('https://chatfun-backend.onrender.com/api/private-messages');
            const unreadMessages = res.data.filter(message => !message.isRead && message.recipientId._id === userId);
            setUnreadMessages(unreadMessages);
            await AsyncStorage.setItem('unreadMessages', JSON.stringify(unreadMessages));
        } catch (err) {
            console.error('Error fetching unread messages:', err.response ? err.response.data : err.message);
        }
    };

    const loadUnreadMessages = async () => {
        try {
            const storedUnreadMessages = await AsyncStorage.getItem('unreadMessages');
            if (storedUnreadMessages) {
                setUnreadMessages(JSON.parse(storedUnreadMessages));
            }
        } catch (err) {
            console.error('Error loading unread messages from storage:', err);
        }
    };

    useEffect(() => {
        loadUnreadMessages();
    }, []);

    const login = async (identifier, password) => {
        try {
            const res = await axios.post('https://chatfun-backend.onrender.com/api/auth/login', { identifier, password });
            await AsyncStorage.setItem('token', res.data.token);
            console.log('Token stored:', res.data.token); // Log the token
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            const userRes = await axios.get('https://chatfun-backend.onrender.com/api/auth/me'); // Fetch user data
            setUser({ ...userRes.data, avatar: userRes.data.avatar || DEFAULT_AVATAR });

            // Emit userOnline event
            socket.emit('userOnline', userRes.data._id);
            socket.emit('joinRoom', { userId: userRes.data._id, roomId: defaultRoomId });

            // Verify the default room exists
            const roomRes = await axios.get(`https://chatfun-backend.onrender.com/api/rooms/${defaultRoomId}`);
            if (roomRes.data) {
                setAlertTitle('Login Successful');
                setAlertMessage('You have successfully logged in.');
                setAlertType('success');
                setAlertVisible(true);
                console.log('User logged in:', userRes.data);
                navigation.navigate('Chat', { roomId: defaultRoomId }); // Redirect to default room after login
            } else {
                setAlertTitle('Error');
                setAlertMessage('Default room not found.');
                setAlertType('error');
                setAlertVisible(true);
            }

            // Fetch unread messages
            fetchUnreadMessages(userRes.data._id);
        } catch (err) {
            console.error('Error in login:', err.response ? err.response.data : err.message);
            if (err.response && err.response.data && err.response.data.error) {
                setAlertTitle('Login Failed');
                setAlertMessage(err.response.data.error);
                setAlertType('error');
                setAlertVisible(true);
            } else {
                setAlertTitle('Login Failed');
                setAlertMessage('An error occurred during login. Please try again.');
                setAlertType('error');
                setAlertVisible(true);
            }
        }
    };

    const register = async (nickname, email, password) => {
        try {
            const res = await axios.post('https://chatfun-backend.onrender.com/api/auth/register', { nickname, email, password });
            await AsyncStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            const userRes = await axios.get('https://chatfun-backend.onrender.com/api/auth/me'); // Fetch user data
            setUser({ ...userRes.data, avatar: userRes.data.avatar || DEFAULT_AVATAR });

            // Emit userOnline event
            socket.emit('userOnline', userRes.data._id);
            socket.emit('joinRoom', { userId: userRes.data._id, roomId: defaultRoomId });

            // Verify the default room exists
            const roomRes = await axios.get(`https://chatfun-backend.onrender.com/api/rooms/${defaultRoomId}`);
            if (roomRes.data) {
                setAlertTitle('Registration Successful');
                setAlertMessage('You have successfully registered.');
                setAlertType('success');
                setAlertVisible(true);
                console.log('User registered:', userRes.data);
                navigation.navigate('Chat', { roomId: defaultRoomId }); // Redirect to default room after registration
            } else {
                setAlertTitle('Error');
                setAlertMessage('Default room not found.');
                setAlertType('error');
                setAlertVisible(true);
            }

            // Fetch unread messages
            fetchUnreadMessages(userRes.data._id);
        } catch (err) {
            console.error('Error in register:', err.response ? err.response.data : err.message);
            if (err.response && err.response.data && err.response.data.error) {
                setAlertTitle('Registration Failed');
                setAlertMessage(err.response.data.error);
                setAlertType('error');
                setAlertVisible(true);
            } else {
                setAlertTitle('Registration Failed');
                setAlertMessage('An error occurred during registration. Please try again.');
                setAlertType('error');
                setAlertVisible(true);
            }
        }
    };

    const logout = async () => {
        if (user && user._id) {
            socket.emit('leaveRoom', { userId: user._id, roomId: defaultRoomId });
            socket.emit('userOffline', user._id);
        }
        await AsyncStorage.setItem('unreadMessages', JSON.stringify(unreadMessages)); // Store unread messages
        await AsyncStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setUnreadMessages([]);
        setAlertTitle('Logout Successful');
        setAlertMessage('You have successfully logged out.');
        setAlertType('success');
        setAlertVisible(true);
        navigation.navigate('Login');
        console.log('User logged out');
    };

    const addFriend = async (friendId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put(`https://chatfun-backend.onrender.com/api/user/add-friend/${friendId}`);
            setUser(prevUser => ({
                ...prevUser,
                friends: res.data.friends
            }));
            setAlertTitle('Friend Added');
            setAlertMessage('You have successfully added a friend.');
            setAlertType('success');
            setAlertVisible(true);
        } catch (err) {
            console.error('Error in addFriend:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while adding a friend.');
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const removeFriend = async (friendId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put(`https://chatfun-backend.onrender.com/api/user/remove-friend/${friendId}`);
            setUser(prevUser => ({
                ...prevUser,
                friends: res.data.friends
            }));
            setAlertTitle('Friend Removed');
            setAlertMessage('You have successfully removed a friend.');
            setAlertType('success');
            setAlertVisible(true);
        } catch (err) {
            console.error('Error in removeFriend:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while removing a friend.');
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const blockUser = async (blockedUserId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put(`https://chatfun-backend.onrender.com/api/user/block-user/${blockedUserId}`);
            setUser(prevUser => ({
                ...prevUser,
                blockedUsers: res.data.blockedUsers
            }));
            setAlertTitle('User Blocked');
            setAlertMessage('You have successfully blocked a user.');
            setAlertType('success');
            setAlertVisible(true);
        } catch (err) {
            console.error('Error in blockUser:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while blocking a user.');
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const unblockUser = async (blockedUserId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put(`https://chatfun-backend.onrender.com/api/user/unblock-user/${blockedUserId}`);
            setUser(prevUser => ({
                ...prevUser,
                blockedUsers: res.data.blockedUsers
            }));
            setAlertTitle('User Unblocked');
            setAlertMessage('You have successfully unblocked a user.');
            setAlertType('success');
            setAlertVisible(true);
        } catch (err) {
            console.error('Error in unblockUser:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while unblocking a user.');
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const isFriend = (userId) => {
        return user && user.friends.some(friend => friend._id === userId);
    };

    const isBlocked = (userId) => {
        return user && user.blockedUsers.some(blockedUser => blockedUser._id === userId);
    };

    const sendPrivateMessage = async (recipientId, message) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Fetch recipient's privacy settings
            const recipientRes = await axios.get(`https://chatfun-backend.onrender.com/api/user/${recipientId}`);
            const recipient = recipientRes.data;

            if (recipient.privacySetting === 'disabled') {
                setAlertTitle('Message Not Sent');
                setAlertMessage('The user has disabled private messages.');
                setAlertType('error');
                setAlertVisible(true);
                return;
            }

            if (recipient.privacySetting === 'friends' && !isFriend(recipientId)) {
                setAlertTitle('Message Not Sent');
                setAlertMessage('The user is accepting private messages only from friends.');
                setAlertType('error');
                setAlertVisible(true);
                return;
            }

            const res = await axios.post('https://chatfun-backend.onrender.com/api/private-messages/send', { recipientId, message });
            return res.data;
        } catch (err) {
            console.error('Error in sendPrivateMessage:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while sending the private message.');
            setAlertType('error');
            setAlertVisible(true);
            throw err;
        }
    };

    const getPrivateMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.get('https://chatfun-backend.onrender.com/api/private-messages');
            return res.data;
        } catch (err) {
            console.error('Error in getPrivateMessages:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while fetching private messages.');
            setAlertType('error');
            setAlertVisible(true);
            throw err;
        }
    };

    const markAsRead = async (messageId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put(`https://chatfun-backend.onrender.com/api/private-messages/read/${messageId}`);
            return res.data;
        } catch (err) {
            console.error('Error in markAsRead:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while marking the message as read.');
            setAlertType('error');
            setAlertVisible(true);
            throw err;
        }
    };
    const banUser = async (userId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put('https://chatfun-backend.onrender.com/api/user/ban-user', { userId });
            setAlertTitle('Success');
            setAlertMessage('User banned successfully.');
            setAlertType('success');
            setAlertVisible(true);
            return res.data;
        } catch (err) {
            console.error('Error in banUser:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while banning the user.');
            setAlertType('error');
            setAlertVisible(true);
            throw err;
        }
    };

    const unbanUser = async (userId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await axios.put('https://chatfun-backend.onrender.com/api/user/unban-user', { userId });
            setAlertTitle('Success');
            setAlertMessage('User unbanned successfully.');
            setAlertType('success');
            setAlertVisible(true);
            return res.data;
        } catch (err) {
            console.error('Error in unbanUser:', err.response ? err.response.data : err.message);
            setAlertTitle('Error');
            setAlertMessage('An error occurred while unbanning the user.');
            setAlertType('error');
            setAlertVisible(true);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            isAdmin,
            login,
            register,
            logout,
            addFriend,
            removeFriend,
            blockUser,
            unblockUser,
            isFriend,
            isBlocked,
            sendPrivateMessage,
            getPrivateMessages,
            markAsRead,
            unreadMessages,
            setUnreadMessages,
            currentPrivateChatUser,
            setCurrentPrivateChatUser,
            setAlertTitle,
            setAlertMessage,
            setAlertType,
            setAlertVisible,
            setAlertOnConfirm,
            setAlertOnCancel,
            banUser, // Add this line
            unbanUser // Add this line
        }}>
            {children}
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onConfirm={alertOnConfirm || (() => setAlertVisible(false))}
                onCancel={alertOnCancel || (() => setAlertVisible(false))}
                type={alertType} // Pass alert type to CustomAlert
            />
        </AuthContext.Provider>
    );
};

export default AuthContext;
