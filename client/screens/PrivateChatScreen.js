import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal, Alert, Dimensions } from 'react-native';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from '../components/Avatar';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

const MESSAGES_LIMIT = 70;
const emojiMap = {
    ':p1:': require('../assets/animations/emoji42.json'),
    ':p2:': require('../assets/animations/emoji43.json'),
    ':p3:': require('../assets/animations/emoji44.json'),
    ':p4:': require('../assets/animations/emoji45.json'),
    ':p5:': require('../assets/animations/emoji46.json'),
    ':p6:': require('../assets/animations/emoji47.json'),
    ':p7:': require('../assets/animations/emoji48.json'),
    ':p8:': require('../assets/animations/emoji49.json'),
    ':p9:': require('../assets/animations/emoji50.json'),
    ':p10:': require('../assets/animations/emoji51.json'),
    ':g:': require('../assets/animations/emoji1.json'),
    ':m:': require('../assets/animations/emoji2.json'),
    ':j:': require('../assets/animations/emoji3.json'),
    ':b:': require('../assets/animations/emoji4.json'),
    ':c:': require('../assets/animations/emoji5.json'),
    ':d:': require('../assets/animations/emoji6.json'),
    ':e:': require('../assets/animations/emoji7.json'),
    ':f:': require('../assets/animations/emoji8.json'),
    ':g1:': require('../assets/animations/emoji9.json'),
    ':h:': require('../assets/animations/emoji10.json'),
    ':i:': require('../assets/animations/emoji11.json'),
    ':j1:': require('../assets/animations/emoji12.json'),
    ':k:': require('../assets/animations/emoji13.json'),
    ':l:': require('../assets/animations/emoji14.json'),
    ':m1:': require('../assets/animations/emoji15.json'),
    ':n:': require('../assets/animations/emoji16.json'),
    ':o:': require('../assets/animations/emoji17.json'),
    ':p:': require('../assets/animations/emoji18.json'),
    ':q:': require('../assets/animations/emoji19.json'),
    ':r:': require('../assets/animations/emoji20.json'),
    ':s:': require('../assets/animations/emoji21.json'),
    ':t:': require('../assets/animations/emoji22.json'),
    ':u:': require('../assets/animations/emoji23.json'),
    ':v:': require('../assets/animations/emoji24.json'),
    ':w:': require('../assets/animations/emoji25.json'),
    ':x:': require('../assets/animations/emoji26.json'),
    ':y:': require('../assets/animations/emoji27.json'),
    ':z:': require('../assets/animations/emoji28.json'),
    ':am1:': require('../assets/animations/emoji29.json'),
    ':am2:': require('../assets/animations/emoji30.json'),
    ':am3:': require('../assets/animations/emoji31.json'),
    ':am4:': require('../assets/animations/emoji32.json'),
    ':am5:': require('../assets/animations/emoji33.json'),
    ':am6:': require('../assets/animations/emoji34.json'),
    ':am7:': require('../assets/animations/emoji35.json'),
    ':am8:': require('../assets/animations/emoji36.json'),
    ':am9:': require('../assets/animations/emoji37.json'),
    ':am10:': require('../assets/animations/emoji38.json'),
    ':am11:': require('../assets/animations/emoji39.json'),
    ':am12:': require('../assets/animations/emoji40.json'),
    ':am13:': require('../assets/animations/emoji41.json'),

    // Add more short codes and corresponding Lottie JSON files here
};

const animatedEmojis = Object.keys(emojiMap);
const { width } = Dimensions.get('window');

const PrivateChatScreen = ({ route, navigation }) => {
    const { userId, nickname, avatar } = route.params;
    const { user, sendPrivateMessage, getPrivateMessages, markAsRead, setUnreadMessages, setCurrentPrivateChatUser, currentPrivateChatUser } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const socket = useRef(null);
    const scrollViewRef = useRef();

    useFocusEffect(
        React.useCallback(() => {
            setCurrentPrivateChatUser(userId);
            return () => setCurrentPrivateChatUser(null);
        }, [userId])
    );

    useEffect(() => {
        socket.current = io('http://192.168.172.192:5000');

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('token');
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const res = await axios.get('http://192.168.172.192:5000/api/private-messages');
                const privateMessages = res.data.filter(
                    msg => (msg.senderId._id === user._id && msg.recipientId._id === userId) ||
                           (msg.senderId._id === userId && msg.recipientId._id === user._id)
                );
                setMessages(privateMessages);
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({ animated: false });
                }

                // Mark messages as read
                const unreadMessages = privateMessages.filter(msg => !msg.isRead && msg.recipientId._id === user._id);
                for (const msg of unreadMessages) {
                    await markAsRead(msg._id);
                }
                setUnreadMessages(prevUnread => prevUnread.filter(msg => msg.senderId._id !== userId));
            } catch (err) {
                console.error('Error fetching private messages:', err.response ? err.response.data : err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        socket.current.on('privateMessage', (newMessage) => {
            if ((newMessage.senderId === userId && newMessage.recipientId === user._id) ||
                (newMessage.senderId === user._id && newMessage.recipientId === userId)) {
                axios.get(`http://192.168.172.192:5000/api/user/${newMessage.senderId}`)
                    .then(senderRes => {
                        newMessage.senderId = senderRes.data;
                        axios.get(`http://192.168.172.192:5000/api/user/${newMessage.recipientId}`)
                            .then(recipientRes => {
                                newMessage.recipientId = recipientRes.data;
                                setMessages((prevMessages) => {
                                    const updatedMessages = [...prevMessages, newMessage];
                                    if (updatedMessages.length > MESSAGES_LIMIT) {
                                        updatedMessages.shift(); // Remove the oldest message
                                    }
                                    if (scrollViewRef.current) {
                                        scrollViewRef.current.scrollToEnd({ animated: true });
                                    }
                                    return updatedMessages;
                                });
                            });
                    });
            }
        });

        return () => {
            socket.current.disconnect();
        };
    }, [userId, user]);

    const handleSendMessage = async () => {
        if (message.trim()) {
            try {
                const newMessage = await sendPrivateMessage(userId, message);
                socket.current.emit('privateMessage', newMessage);
                setMessage('');
                if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({ animated: true });
                }
                console.log('Message sent:', newMessage);
            } catch (err) {
                console.error('Error sending private message:', err);
            }
        }
    };

    const appendEmoji = (shortCode) => {
        // Append the short code to the current message
        setMessage((prevMessage) => `${prevMessage} ${shortCode}`);
    };

    const renderMessageContent = (message) => {
        if (!message) return null; // Handle undefined message
        const parts = message.split(/(:\w+:)/g); // Split message by short codes
        return (
            <Text style={styles.messageText}>
                {parts.map((part, index) => {
                    if (emojiMap[part]) {
                        return (
                            <LottieView
                                key={index}
                                source={emojiMap[part]}
                                autoPlay
                                loop
                                style={styles.emoji}
                            />
                        );
                    } else {
                        return <Text key={index} style={styles.textPart}>{part}</Text>;
                    }
                })}
            </Text>
        );
    };

    const renderItem = (item) => {
        const isSender = item.senderId._id === user._id;
        const displayAvatar = isSender ? user.avatar : item.senderId.avatar;
        const displayNickname = isSender ? user.nickname : item.senderId.nickname;

        console.log('Rendering message:', item);
        console.log('isSender:', isSender);
        console.log('displayAvatar:', displayAvatar);
        console.log('displayNickname:', displayNickname);

        return (
            <View key={item._id} style={isSender ? styles.myMessageContainer : styles.theirMessageContainer}>
                <Avatar avatarPath={displayAvatar} />
                <View style={styles.messageContent}>
                    <Text style={styles.nickname}>{displayNickname}</Text>
                    <View style={styles.messageTextContainer}>
                        {item.message?.endsWith('.jpg') || item.message?.endsWith('.jpeg') || item.message?.endsWith('.png') ? (
                            <TouchableOpacity onPress={() => navigation.navigate('ImageView', { fileName: item.message })}>
                                <Text style={styles.imageLink}>{item.message}</Text>
                            </TouchableOpacity>
                        ) : (
                            renderMessageContent(item.message || '')
                        )}
                    </View>
                    <Text style={styles.messageTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust the offset as needed
        >
            <View style={styles.container}>
                {loading && <ActivityIndicator size="large" color="#007bff" />}
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                >
                    {messages.map(renderItem)}
                </ScrollView>
                {emojiPickerVisible && (
                    <View style={styles.emojiPickerContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiScrollView}>
                            {animatedEmojis.map((emoji, index) => (
                                <TouchableOpacity key={index} onPress={() => appendEmoji(emoji)}>
                                    <LottieView
                                        source={emojiMap[emoji]}
                                        autoPlay
                                        loop
                                        style={styles.emoji}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message"
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity style={styles.iconButton} onPress={handleSendMessage}>
                        <FontAwesome name="send" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setEmojiPickerVisible(!emojiPickerVisible)}>
                        <FontAwesome name="smile-o" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    messageList: {
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    myMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align items to the start
        padding: 10,
        backgroundColor: '#e1ffc7',
        alignSelf: 'flex-end',
        borderRadius: 10,
        margin: 5,
        maxWidth: '80%', // Ensure the message does not exceed 80% of the screen width
    },
    theirMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align items to the start
        padding: 10,
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
        borderRadius: 10,
        margin: 5,
        maxWidth: '80%', // Ensure the message does not exceed 80% of the screen width
    },
    messageContent: {
        marginLeft: 10,
        flex: 1, // Allow the message content to take up the remaining space
    },
    nickname: {
        fontWeight: 'bold',
    },
    messageTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    messageText: {
        fontSize: 16,
        flexWrap: 'wrap', // Ensure the text wraps to the next line if it's too long
    },
    textPart: {
        fontSize: 16,
    },
    emoji: {
        width: 24, // Adjust size as needed
        height: 24, // Adjust size as needed
        marginBottom: -5, // Adjust to align with text
    },
    messageTime: {
        fontSize: 12,
        color: '#666',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    iconButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    emojiPickerContainer: {
        width: width, // Full width
        height: 100, // Adjust height as needed
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark black transparent background
        padding: 10,
        position: 'absolute',
        bottom: 60, // Position above the input container
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiScrollView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageLink: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});

export default PrivateChatScreen;
