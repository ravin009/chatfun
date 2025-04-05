import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Modal, Alert, Dimensions, Animated } from 'react-native';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from '../components/Avatar';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import ProfileViewModal from '../components/ProfileViewModal';
import PrivateMessageBox from '../components/PrivateMessageBox'; // Make sure to import PrivateMessageBox

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
    const { user, sendPrivateMessage, getPrivateMessages, markAsRead, setUnreadMessages, setCurrentPrivateChatUser, currentPrivateChatUser, addFriend, removeFriend, blockUser, unblockUser, isFriend, isBlocked } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const [userOptionsVisible, setUserOptionsVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [profileViewVisible, setProfileViewVisible] = useState(false);
    const [privateMessageBoxVisible, setPrivateMessageBoxVisible] = useState(false);
    const [privateMessageRecipient, setPrivateMessageRecipient] = useState(null);
    const [privateMessageRecipientGender, setPrivateMessageRecipientGender] = useState(null);
    const [privateMessageRecipientNickname, setPrivateMessageRecipientNickname] = useState(null);
    const socket = useRef(null);
    const scrollViewRef = useRef();
    const sendButtonScale = useRef(new Animated.Value(1)).current;

    useFocusEffect(
        React.useCallback(() => {
            setCurrentPrivateChatUser(userId);
            return () => setCurrentPrivateChatUser(null);
        }, [userId])
    );

    useEffect(() => {
        socket.current = io('https://chatfun-backend.onrender.com');

        const fetchMessages = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const res = await axios.get('https://chatfun-backend.onrender.com/api/private-messages');
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
            }
        };

        fetchMessages();

        socket.current.on('privateMessage', (newMessage) => {
            if ((newMessage.senderId === userId && newMessage.recipientId === user._id) ||
                (newMessage.senderId === user._id && newMessage.recipientId === userId)) {
                axios.get(`https://chatfun-backend.onrender.com/api/user/${newMessage.senderId}`)
                    .then(senderRes => {
                        newMessage.senderId = senderRes.data;
                        axios.get(`https://chatfun-backend.onrender.com/api/user/${newMessage.recipientId}`)
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
            const messageToSend = message; // Store the message to send
            setMessage(''); // Clear the input box immediately

            // Animate the send button
            Animated.sequence([
                Animated.timing(sendButtonScale, {
                    toValue: 0.9,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(sendButtonScale, {
                    toValue: 1,
                    duration: 50,
                    useNativeDriver: true,
                }),
            ]).start();

            try {
                const newMessage = await sendPrivateMessage(userId, messageToSend);
                socket.current.emit('privateMessage', newMessage);
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
                    <TouchableOpacity onPress={() => handleUserOptions(item.senderId)}>
                        <Text style={styles.nickname}>{displayNickname}</Text>
                    </TouchableOpacity>
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

    const handleUserOptions = (user) => {
        setSelectedUser(user);
        setUserOptionsVisible(true);
    };

    const handleAddFriend = async () => {
        try {
            await addFriend(selectedUser._id);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error adding friend:', err);
        }
    };

    const handleRemoveFriend = async () => {
        try {
            await removeFriend(selectedUser._id);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error removing friend:', err);
        }
    };

    const handleBlockUser = async () => {
        try {
            await blockUser(selectedUser._id);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error blocking user:', err);
        }
    };

    const handleUnblockUser = async () => {
        try {
            await unblockUser(selectedUser._id);
            setUserOptionsVisible(false);
        } catch (err) {
            console.error('Error unblocking user:', err);
        }
    };

    const handleViewProfile = () => {
        setUserOptionsVisible(false);
        setProfileViewVisible(true);
    };

    const handleSendMessageFromProfile = (recipientId, recipientGender, recipientNickname) => {
        setPrivateMessageRecipient(recipientId);
        setPrivateMessageRecipientGender(recipientGender);
        setPrivateMessageRecipientNickname(recipientNickname);
        setPrivateMessageBoxVisible(true);
        setProfileViewVisible(false);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust the offset as needed
        >
            <View style={styles.container}>
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
                                        style={styles.emojiLarge}
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
                        placeholderTextColor="#888"
                        value={message}
                        onChangeText={setMessage}
                    />
                    <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
                        <TouchableOpacity style={styles.iconButton} onPress={handleSendMessage}>
                            <FontAwesome name="send" size={24} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setEmojiPickerVisible(!emojiPickerVisible)}>
                        <FontAwesome name="smile-o" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <Modal
                    visible={userOptionsVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setUserOptionsVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{selectedUser?.nickname}</Text>
                            <TouchableOpacity style={styles.optionButton} onPress={handleViewProfile}>
                                <FontAwesome name="user" size={16} color="blue" />
                                <Text style={styles.optionText}>View Profile</Text>
                            </TouchableOpacity>
                            {isFriend(selectedUser?._id) ? (
                                <TouchableOpacity style={styles.optionButton} onPress={handleRemoveFriend}>
                                    <FontAwesome name="user-times" size={16} color="red" />
                                    <Text style={styles.optionText}>Remove Friend</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.optionButton} onPress={handleAddFriend}>
                                    <FontAwesome name="user-plus" size={16} color="green" />
                                    <Text style={styles.optionText}>Add Friend</Text>
                                </TouchableOpacity>
                            )}
                            {isBlocked(selectedUser?._id) ? (
                                <TouchableOpacity style={styles.optionButton} onPress={handleUnblockUser}>
                                    <FontAwesome name="unlock" size={16} color="green" />
                                    <Text style={styles.optionText}>Unblock User</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.optionButton} onPress={handleBlockUser}>
                                    <FontAwesome name="ban" size={16} color="red" />
                                    <Text style={styles.optionText}>Block User</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.closeButton} onPress={() => setUserOptionsVisible(false)}>
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <ProfileViewModal
                    visible={profileViewVisible}
                    onClose={() => setProfileViewVisible(false)}
                    userId={selectedUser?._id}
                    onSendMessage={handleSendMessageFromProfile}
                />
                <PrivateMessageBox
                    visible={privateMessageBoxVisible}
                    onClose={() => setPrivateMessageBoxVisible(false)}
                    onSend={handleSendMessage}
                    recipientId={privateMessageRecipient}
                    recipientGender={privateMessageRecipientGender}
                    recipientNickname={privateMessageRecipientNickname}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    messageList: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 10,
        paddingVertical: 20,
    },
    myMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
        backgroundColor: '#d1e7dd',
        alignSelf: 'flex-end',
        borderRadius: 20,
        marginVertical: 5,
        maxWidth: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    theirMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
        backgroundColor: '#ffffff',
        alignSelf: 'flex-start',
        borderRadius: 20,
        marginVertical: 5,
        maxWidth: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    messageContent: {
        marginLeft: 10,
        flex: 1,
    },
    nickname: {
        fontWeight: 'bold',
        color: '#007bff',
    },
    messageTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    messageText: {
        fontSize: 16,
        flexWrap: 'wrap',
        color: '#333',
    },
    textPart: {
        fontSize: 16,
    },
    emoji: {
        width: 30,
        height: 30,
        marginBottom: -5,
    },
    emojiLarge: {
        width: 40,
        height: 40,
        marginBottom: -5,
    },
    messageTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
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
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        color: '#333',
    },
    iconButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    emojiPickerContainer: {
        width: width,
        height: 120,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        position: 'absolute',
        bottom: 60,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginVertical: 5,
        width: '100%',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 18,
        marginLeft: 10,
        color: '#333',
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default PrivateChatScreen;
