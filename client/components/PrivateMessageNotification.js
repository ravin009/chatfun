import React, { useMemo, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import AuthContext from '../context/AuthContext';

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
};

const PrivateMessageNotification = ({ message, onClose, onReply, onViewProfile }) => {
    const { currentPrivateChatUser } = useContext(AuthContext);
    const pan = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => {
            // Do nothing on release to keep the box where it was dragged
        },
    }), [pan]);

    const backgroundColor = message.senderId?.gender === 'Female' ? '#E0218A' : '#0000FF';

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

    // Suppress notification if the current private chat user matches the sender or recipient
    if (currentPrivateChatUser && (currentPrivateChatUser === message.senderId._id || currentPrivateChatUser === message.recipientId._id)) {
        return null;
    }

    return (
        <Modal
            visible={true}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.notificationContainer, { transform: [{ translateX: pan.x }, { translateY: pan.y }], backgroundColor }]}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>{message.senderId.nickname}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome name="times" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.messageTextContainer}>
                        {message?.message?.endsWith('.jpg') || message?.message?.endsWith('.jpeg') || message?.message?.endsWith('.png') ? (
                            <Text style={styles.imageLink}>You have received an image</Text>
                        ) : (
                            renderMessageContent(message?.message || '')
                        )}
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => {
                            console.log('Reply button clicked');
                            console.log('Sender ID:', message.senderId?._id);
                            console.log('Sender Gender:', message.senderId?.gender);
                            console.log('Sender Nickname:', message.senderId?.nickname);
                            onReply(message.senderId?._id, message.senderId?.gender, message.senderId?.nickname);
                        }}>
                            <Text style={styles.buttonText}>Reply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={onViewProfile}>
                            <Text style={styles.buttonText}>About User</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        top: '-28%'
    },
    notificationContainer: {
        width: '80%',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        zIndex: 1000, // Ensure the notification is on top
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        flex: 1, // Center the title
    },
    messageTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center', // Align items to the center
        justifyContent: 'center', // Center the content horizontally
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width: '100%', // Ensure the button container takes the full width
    },
    iconButton: {
        padding: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    emoji: {
        width: 24, // Adjust size as needed
        height: 24, // Adjust size as needed
        marginBottom: -5, // Adjust to align with text
    },
    textPart: {
        lineHeight: 24, // Ensure the text line height matches the emoji height
        color: 'white', // Ensure text color is white for better contrast
    },
    imageLink: {
        color: 'white',
        textDecorationLine: 'underline',
    },
});

export default PrivateMessageNotification;

