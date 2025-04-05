import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, PanResponder, Alert, ScrollView, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
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

     // new emojis
     ':a1:': require('../assets/animations/emoji52.json'),
     ':a2:': require('../assets/animations/emoji53.json'),
     ':a3:': require('../assets/animations/emoji54.json'),
     ':a4:': require('../assets/animations/emoji55.json'),
     ':a5:': require('../assets/animations/emoji56.json'),
     ':a6:': require('../assets/animations/emoji57.json'),
     ':a7:': require('../assets/animations/emoji58.json'),
     ':a8:': require('../assets/animations/emoji59.json'),
     ':a10:': require('../assets/animations/emoji61.json'),
     ':b1:': require('../assets/animations/emoji62.json'),
     ':b2:': require('../assets/animations/emoji63.json'),
     ':b3:': require('../assets/animations/emoji64.json'),
     ':b4:': require('../assets/animations/emoji65.json'),
     ':b5:': require('../assets/animations/emoji66.json'),
     ':b6:': require('../assets/animations/emoji67.json'),
     ':b7:': require('../assets/animations/emoji68.json'),
     ':b8:': require('../assets/animations/emoji69.json'),
     ':b9:': require('../assets/animations/emoji70.json'),
     ':b10:': require('../assets/animations/emoji71.json'),
     // new emojis till this line


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

const animatedEmojis = Object.keys(emojiMap);

const PrivateMessageBox = ({ visible, onClose, onSend, recipientId, recipientGender, recipientNickname }) => {
    const [message, setMessage] = useState('');
    const [alertShown, setAlertShown] = useState(false);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const pan = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];

    useEffect(() => {
        if (visible) {
            console.log('PrivateMessageBox opened');
            console.log('Recipient ID:', recipientId);
            console.log('Recipient Gender:', recipientGender);
            console.log('Recipient Nickname:', recipientNickname);
        }
    }, [visible, recipientId, recipientGender, recipientNickname]);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: () => {
            // Do nothing on release to keep the box where it was dragged
        },
    }), [pan]);

    const handleChangeText = (text) => {
        if (text.length > 250) {
            if (!alertShown) {
                Alert.alert('Error', 'Message cannot exceed 250 characters.');
                setAlertShown(true);
            }
        } else {
            setMessage(text);
            setAlertShown(false);
        }
    };

    const handleSend = () => {
        if (message.trim() && message.length <= 250) {
            onSend(message);
            setMessage('');
        } else if (!message.trim()) {
            Alert.alert('Error', 'Message cannot be empty.');
        }
    };

    const appendEmoji = (shortCode) => {
        setMessage((prevMessage) => `${prevMessage} ${shortCode}`);
    };

    const backgroundColor = recipientGender === 'Female' ? '#E0218A' : '#0000FF';

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[styles.modalContent, { transform: [{ translateX: pan.x }, { translateY: pan.y }], backgroundColor }]}
                >
                    <TouchableOpacity style={styles.closeIconButton} onPress={onClose}>
                        <FontAwesome name="times" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.header}>
                        <Text style={styles.title}>Private Message to {recipientNickname}</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        value={message}
                        onChangeText={handleChangeText}
                        multiline
                        numberOfLines={4}
                        maxLength={250}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.iconButton} onPress={handleSend}>
                            <FontAwesome name="send" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setEmojiPickerVisible(!emojiPickerVisible)}>
                            <FontAwesome name="smile-o" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    {emojiPickerVisible && (
                        <View style={styles.emojiPickerContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    closeIconButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 5, // Decrease padding to reduce height
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: 'white',
        textAlignVertical: 'top', // Ensure text starts from the top
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    iconButton: {
        padding: 10,
    },
    emojiPickerContainer: {
        marginTop: 10,
        width: '100%',
        height: 100, // Adjust height as needed
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 10,
        padding: 10,
    },
    emoji: {
        width: 30, // Adjust size as needed
        height: 30, // Adjust size as needed
        margin: 5,
    },
});

export default PrivateMessageBox;
