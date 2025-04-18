import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Alert, Modal, Text, StyleSheet, FlatList, Dimensions, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash.debounce';

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

    ':d1:': require('../assets/animations/emoji72.json'),
    ':d2:': require('../assets/animations/emoji77.json'),
    
   

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
    // Add more short codes and corresponding Lottie JSON files here
};

const animatedEmojis = Object.keys(emojiMap);
const { width, height } = Dimensions.get('window');

const MessageInput = ({ sendMessage, sendImage }) => {
    const [message, setMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
    const scaleValue = new Animated.Value(1);

    const handleChangeText = (text) => {
        if (text.length > 170) {
            Alert.alert('Error', 'Message cannot exceed 170 characters.');
        } else {
            setMessage(text);
        }
    };

    const handleSendMessage = () => {
        if (message.trim() && message.length <= 170) {
            const trimmedMessage = message.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
            sendMessage(trimmedMessage);
            setMessage('');
        }
    };

    const requestCameraPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permissions are required to take a photo.');
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // Disable editing to send the full, original image
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            sendImage(uri);
            setModalVisible(false);
        }
    };

    const takePhoto = async () => {
        const hasPermission = await requestCameraPermissions();
        if (!hasPermission) return;

        try {
            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: false, // Disable editing to send the full, original image
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                const timestamp = Date.now();
                const newUri = `${FileSystem.documentDirectory}live_${timestamp}.jpeg`;

                try {
                    await FileSystem.moveAsync({
                        from: uri,
                        to: newUri,
                    });

                    const contentUri = await FileSystem.getContentUriAsync(newUri);
                    sendImage(contentUri);
                    setModalVisible(false);
                } catch (error) {
                    console.error('Error renaming file:', error);
                    Alert.alert('Error', 'Failed to rename the image file.');
                }
            }
        } catch (error) {
            console.error('Error launching camera:', error);
            Alert.alert('Error', 'Failed to launch the camera.');
        }
    };

    const appendEmoji = (shortCode) => {
        // Append the short code to the current message
        setMessage((prevMessage) => `${prevMessage} ${shortCode}`);
    };

    const animateButton = () => {
        Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const renderEmoji = ({ item }) => (
        <TouchableOpacity onPress={() => appendEmoji(item)}>
            <LottieView
                source={emojiMap[item]}
                autoPlay
                loop
                style={styles.emoji}
            />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {emojiPickerVisible && (
                <View style={styles.emojiPickerContainer}>
                    <FlatList
                        data={animatedEmojis}
                        renderItem={renderEmoji}
                        keyExtractor={(item, index) => index.toString()}
                        numColumns={8} // Adjust the number of columns as needed
                        contentContainerStyle={styles.emojiScrollView}
                        showsVerticalScrollIndicator={true}
                    />
                    <TouchableOpacity style={styles.closeButton} onPress={() => setEmojiPickerVisible(false)}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            )}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message"
                    placeholderTextColor="#888"
                    value={message}
                    onChangeText={handleChangeText}
                    multiline
                    numberOfLines={2}
                />
                <Animated.View style={[styles.iconButtonContainer, { transform: [{ scale: scaleValue }] }]}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => { handleSendMessage(); animateButton(); }}>
                        <LinearGradient
                            colors={['#6a11cb', '#2575fc']}
                            style={styles.gradientButton}
                        >
                            <FontAwesome name="paper-plane" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => { setModalVisible(true); animateButton(); }}>
                        <LinearGradient
                            colors={['#ff512f', '#dd2476']}
                            style={styles.gradientButton}
                        >
                            <FontAwesome name="image" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={() => { setEmojiPickerVisible(!emojiPickerVisible); animateButton(); }}>
                        <LinearGradient
                            colors={['#43e97b', '#38f9d7']}
                            style={styles.gradientButton}
                        >
                            <FontAwesome name="smile-o" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={modalStyles.modalContainer}>
                    <View style={modalStyles.modalContent}>
                        <Text style={modalStyles.modalTitle}>Send Image</Text>
                        <TouchableOpacity style={modalStyles.optionButton} onPress={pickImage}>
                            <FontAwesome name="image" size={24} color="black" />
                            <Text style={modalStyles.optionText}>From Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.optionButton} onPress={takePhoto}>
                            <FontAwesome name="camera" size={24} color="black" />
                            <Text style={modalStyles.optionText}>Live from Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={modalStyles.buttonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const modalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff', // White non-transparent background
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
        padding: 15,
        marginVertical: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        width: '100%',
        justifyContent: 'center',
    },
    optionText: {
        marginLeft: 10,
        fontSize: 16,
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#2c3e50', // Darker background for the input container
        height: 60, // Decrease the height of the container
    },
    input: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        textAlignVertical: 'top', // Ensure text starts from the top
        color: 'white', // Set input text color to white
        backgroundColor: '#34495e', // Darker background for the input box
        marginRight: 10, // Add margin to the right of the input box
    },
    iconButtonContainer: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
        width: 40, // Make the buttons square
        height: 40, // Make the buttons square
    },
    gradientButton: {
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    emojiPickerContainer: {
        position: 'absolute',
        bottom: 60, // Position above the input container
        width: '100%',
        maxHeight: height * 0.4, // Adjust height as needed
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark black transparent background
        padding: 10,
        alignItems: 'center',
    },
    emojiScrollView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        width: 30, // Adjust size as needed
        height: 30, // Adjust size as needed
        margin: 5,
    },
});

export default MessageInput;
