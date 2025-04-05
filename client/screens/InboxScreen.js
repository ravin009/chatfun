import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from '../components/Avatar';
import LottieView from 'lottie-react-native';
import SkeletonLoader from '../components/SkeletonLoader';

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

const PAGE_SIZE = 10; // Number of conversations to load per page

const InboxScreen = ({ navigation }) => {
    const { user, getPrivateMessages, markAsRead, setUnreadMessages, unreadMessages } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const cachedConversations = await AsyncStorage.getItem('conversations');
                if (cachedConversations) {
                    setConversations(JSON.parse(cachedConversations));
                }

                const messages = await getPrivateMessages();
                const uniqueConversations = {};

                for (const message of messages) {
                    const otherUser = message.senderId._id === user._id ? message.recipientId : message.senderId;
                    if (!uniqueConversations[otherUser._id] || new Date(message.createdAt) > new Date(uniqueConversations[otherUser._id].createdAt)) {
                        uniqueConversations[otherUser._id] = { ...message, otherUser };
                    }
                }

                const sortedConversations = Object.values(uniqueConversations).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                // Fetch user details for the first page
                const initialConversations = await fetchUserDetails(sortedConversations.slice(0, PAGE_SIZE));
                setConversations(initialConversations);
                setHasMore(sortedConversations.length > PAGE_SIZE);

                // Cache the conversations
                await AsyncStorage.setItem('conversations', JSON.stringify(initialConversations));
            } catch (err) {
                console.error('Error fetching conversations:', err.response ? err.response.data : err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    const fetchUserDetails = async (conversations) => {
        return await Promise.all(
            conversations.map(async (conversation) => {
                const userRes = await axios.get(`https://chatfun-backend.onrender.com/api/user/${conversation.otherUser._id}`);
                return { ...conversation, otherUser: userRes.data };
            })
        );
    };

    const loadMoreConversations = async () => {
        if (!hasMore || loading) return;

        setLoading(true);
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
            const nextPageConversations = await fetchUserDetails(sortedConversations.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));

            setConversations((prevConversations) => [...prevConversations, ...nextPageConversations]);
            setPage((prevPage) => prevPage + 1);
            setHasMore(sortedConversations.length > (page + 1) * PAGE_SIZE);

            // Cache the updated conversations
            await AsyncStorage.setItem('conversations', JSON.stringify([...conversations, ...nextPageConversations]));
        } catch (err) {
            console.error('Error loading more conversations:', err.response ? err.response.data : err.message);
        } finally {
            setLoading(false);
        }
    };

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
                {loading && page === 1 ? (
                    <SkeletonLoader />
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
                        onEndReached={loadMoreConversations}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={loading && hasMore ? <ActivityIndicator size="small" color="#007bff" /> : null}
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
