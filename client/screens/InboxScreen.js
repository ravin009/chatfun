import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from '../components/Avatar';
import LottieView from 'lottie-react-native';

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
};

const InboxScreen = ({ navigation }) => {
    const { user, getPrivateMessages, markAsRead, setUnreadMessages, unreadMessages } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const messages = await getPrivateMessages();
                const uniqueConversations = {};

                for (const message of messages) {
                    const otherUser = message.senderId._id === user._id ? message.recipientId : message.senderId;
                    if (!uniqueConversations[otherUser._id] || new Date(message.createdAt) > new Date(uniqueConversations[otherUser._id].createdAt)) {
                        uniqueConversations[otherUser._id] = { ...message, otherUser };
                    }
                }

                const sortedConversations = Object.values(uniqueConversations).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Fetch user details for each conversation
                const updatedConversations = await Promise.all(
                    sortedConversations.map(async (conversation) => {
                        const userRes = await axios.get(`http://192.168.202.192:5000/api/user/${conversation.otherUser._id}`);
                        return { ...conversation, otherUser: userRes.data };
                    })
                );

                setConversations(updatedConversations);
            } catch (err) {
                console.error('Error fetching conversations:', err.response ? err.response.data : err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    const handleConversationPress = async (otherUserId) => {
        try {
            const messages = await getPrivateMessages();
            const unreadMessages = messages.filter(message => !message.isRead && message.senderId._id === otherUserId && message.recipientId._id === user._id);

            for (const message of unreadMessages) {
                await markAsRead(message._id);
            }

            setUnreadMessages(prevUnread => prevUnread.filter(message => message.senderId._id !== otherUserId));

            navigation.navigate('PrivateChat', { userId: otherUserId, nickname: conversations.find(conv => conv.otherUser._id === otherUserId).otherUser.nickname, avatar: conversations.find(conv => conv.otherUser._id === otherUserId).otherUser.avatar });
        } catch (err) {
            console.error('Error marking messages as read:', err.response ? err.response.data : err.message);
        }
    };

    const renderMessageContent = (message) => {
        if (!message) return null; // Handle undefined message
        const parts = message.split(/(:\w+:)/g); // Split message by short codes
        return parts.map((part, index) => {
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
        });
    };

    const renderItem = useCallback(({ item }) => {
        const hasUnreadMessages = unreadMessages.some(message => message.senderId._id === item.otherUser._id);
        const lastMessage = item.message.length > 30 ? `${item.message.substring(0, 30)}...` : item.message;
        const isUnread = !item.isRead && item.recipientId._id === user._id;

        return (
            <TouchableOpacity
                style={[styles.conversationItem, { backgroundColor: item.otherUser.nicknameColor || '#fff' }]}
                onPress={() => handleConversationPress(item.otherUser._id)}
            >
                <Avatar avatarPath={item.otherUser.avatar} />
                <View style={styles.conversationDetails}>
                    <Text style={styles.nickname}>{item.otherUser.nickname}</Text>
                    <View style={styles.lastMessageContainer}>
                        {renderMessageContent(lastMessage)}
                    </View>
                </View>
                {hasUnreadMessages && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
        );
    }, [unreadMessages, conversations]);

    const keyExtractor = useCallback((item) => item.otherUser._id, []);

    const memoizedConversations = useMemo(() => conversations, [conversations]);

    return (
        <View style={styles.outerContainer}>
            <View style={styles.innerContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : (
                    <FlatList
                        data={memoizedConversations}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={styles.list}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={21}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderWidth: 2,
        borderColor: '#007bff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    innerContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
    },
    list: {
        padding: 10,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        transform: [{ translateY: -5 }],
        borderWidth: 1,
        borderColor: '#dcdcdc',
    },
    conversationDetails: {
        marginLeft: 10,
        flex: 1,
    },
    nickname: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    lastMessageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginTop: 5,
    },
    textPart: {
        color: '#666',
    },
    emoji: {
        width: 24, // Adjust size as needed
        height: 24, // Adjust size as needed
        marginBottom: -5, // Adjust to align with text
    },
    unreadIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
        marginLeft: 10,
    },
});

export default InboxScreen;
