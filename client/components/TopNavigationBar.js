import React, { useMemo, useState, useEffect, useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, PanResponder, Text, ScrollView, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import Avatar from './Avatar';

const { height } = Dimensions.get('window');

const TopNavigationBar = ({ navigation, handleRoomInfo, showNavBar, setShowNavBar, roomId }) => {
    const { user, unreadMessages, logout } = useContext(AuthContext);
    const [userCounts, setUserCounts] = useState({ maleCount: 0, femaleCount: 0 });
    const [usersInRoom, setUsersInRoom] = useState([]);
    const [usersListVisible, setUsersListVisible] = useState(false);
    const pan = useState(new Animated.ValueXY({ x: 0, y: -100 }))[0];

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            return Math.abs(gestureState.dy) > 5;
        },
        onPanResponderMove: (evt, gestureState) => {
            Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(evt, gestureState);
        },
        onPanResponderRelease: (evt, gestureState) => {
            if (gestureState.dy > 30) {
                setShowNavBar(true);
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                    friction: 8,
                    tension: 40,
                }).start();
            } else if (gestureState.dy < -30) {
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

    useEffect(() => {
        if (showNavBar) {
            Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
                friction: 8,
                tension: 40,
            }).start();
        } else {
            Animated.spring(pan, {
                toValue: { x: 0, y: -100 },
                useNativeDriver: false,
                friction: 8,
                tension: 40,
            }).start();
        }
    }, [showNavBar, pan]);

    useEffect(() => {
        const socket = io('https://chatfun-backend.onrender.com');
        if (user && roomId) {
            socket.emit('joinRoom', { userId: user._id, roomId });

            socket.on('userCounts', ({ roomId: eventRoomId, maleCount, femaleCount }) => {
                if (eventRoomId === roomId) {
                    setUserCounts({ maleCount, femaleCount });
                }
            });

            socket.on('userList', ({ roomId: eventRoomId, users }) => {
                if (eventRoomId === roomId) {
                    setUsersInRoom(users);
                }
            });

            return () => {
                socket.emit('leaveRoom', { userId: user._id, roomId });
                socket.disconnect();
            };
        }
    }, [user, roomId]);

    const handleUserCountPress = () => {
        setUsersListVisible(!usersListVisible);
    };

    const handleLogout = async () => {
        if (user && user._id) {
            const socket = io('https://chatfun-backend.onrender.com');
            socket.emit('leaveRoom', { userId: user._id, roomId });
            socket.emit('userOffline', user._id);
            socket.disconnect();
        }
        await logout();
    };

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[styles.container, { transform: [{ translateY: pan.y }] }]}
        >
            <View style={styles.block}>
                <TouchableOpacity style={styles.icon} onPress={handleRoomInfo}>
                    <FontAwesome name="info-circle" size={18} color="green" />
                </TouchableOpacity>
            </View>
            <View style={styles.block}>
                <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('RoomList')}>
                    <FontAwesome name="home" size={18} color="green" />
                </TouchableOpacity>
            </View>

            <View style={styles.block}>
                <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Inbox')}>
                    <FontAwesome name="envelope" size={16} color="green" />
                    {unreadMessages.length > 0 && <View style={styles.unreadDot} />}
                </TouchableOpacity>
            </View>
            <View style={styles.block}>
                <TouchableOpacity style={styles.icon} onPress={handleUserCountPress}>
                    <Text style={styles.userCountText}>
                        <Text style={styles.femaleCount}>{userCounts.femaleCount}</Text>/
                        <Text style={styles.maleCount}>{userCounts.maleCount}</Text>
                    </Text>
                </TouchableOpacity>
            </View>
            {usersListVisible && (
                <View style={styles.usersListContainer}>
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 5,
        marginTop: 25,
        marginHorizontal: 'auto',
        borderRadius: 15,
        width: '60%',
        position: 'absolute',
        top: 0,
        left: '20%',
        zIndex: 1000,
    },
    block: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 5,
        margin: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    icon: {
        padding: 5,
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        backgroundColor: 'red',
        borderRadius: 4,
    },
    userCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userCountText: {
        fontSize: 16,
        color: 'white',
    },
    femaleCount: {
        color: 'pink',
    },
    maleCount: {
        color: 'cyan',
    },
    usersListContainer: {
        position: 'absolute',
        top: 60, // Adjust based on the height of the navigation bar
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 10,
        padding: 10,
        maxHeight: height * 0.4, // Adjust the max height as needed
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
        color: 'white',
    },
    emptyListText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default TopNavigationBar;
