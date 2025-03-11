import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from './Avatar';

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

const ProfileViewModal = ({ visible, onClose, userId, onSendMessage }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewingProfilePicture, setViewingProfilePicture] = useState(false);
    const [viewingAvatar, setViewingAvatar] = useState(false);
    const [viewingFullBio, setViewingFullBio] = useState(false);

    const handleViewProfilePicture = useCallback(async () => {
        setViewingProfilePicture(true);
        await ScreenCapture.preventScreenCaptureAsync();
    }, []);

    const handleCloseProfilePicture = useCallback(async () => {
        setViewingProfilePicture(false);
        await ScreenCapture.allowScreenCaptureAsync();
    }, []);

    const handleViewAvatar = useCallback(async () => {
        setViewingAvatar(true);
        await ScreenCapture.preventScreenCaptureAsync();
    }, []);

    const handleCloseAvatar = useCallback(async () => {
        setViewingAvatar(false);
        await ScreenCapture.allowScreenCaptureAsync();
    }, []);

    const handleViewFullBio = useCallback(() => {
        setViewingFullBio(true);
    }, []);

    const handleCloseFullBio = useCallback(() => {
        setViewingFullBio(false);
    }, []);

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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const res = await axios.get(`http://192.168.202.192:5000/api/user/${userId}`);
                setProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile:', err.response ? err.response.data : err.message);
            } finally {
                setLoading(false);
            }
        };

        if (visible) {
            fetchProfile();
        }
    }, [userId, visible]);

    if (loading) {
        return (
            <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                </View>
            </Modal>
        );
    }

    if (!profile) {
        return (
            <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.errorText}>Error loading profile.</Text>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.profileModalContent}>
                    <View style={styles.iconContainer}>
                        <TouchableOpacity onPress={handleViewAvatar} style={styles.iconButton}>
                            <FontAwesome name="user-circle" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onSendMessage(profile._id, profile.gender, profile.nickname)} style={styles.iconButton}>
                            <FontAwesome name="envelope" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleViewProfilePicture} style={styles.iconButton}>
                            <FontAwesome name="image" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Avatar avatarPath={profile.avatar} style={styles.profileAvatar} />
                    <Text style={styles.profileNickname}>{profile.nickname}</Text>
                    {profile.isOnline && (
                        <View style={styles.onlineStatusContainer}>
                            <View style={styles.onlineIndicator} />
                            <Text style={styles.onlineText}>Online</Text>
                        </View>
                    )}
                    <Text style={styles.profileUUID}>UUID: {profile.uuid}</Text>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.profileRating}>Messages: <Text style={styles.highlightedRating}>{profile.chatMessageCount}</Text></Text>
                        <Text style={styles.profileRating}>Private Messages: <Text style={styles.highlightedRating}>{profile.privateMessageCount}</Text></Text>
                        <Text style={styles.profileRating}>Rating: <Text style={styles.highlightedRating}>{profile.rating}</Text></Text>
                    </View>
                    <View style={styles.profileDetailsContainer}>
                        <Text style={styles.profileDetail}>{profile.maritalStatus}</Text>
                        <Text style={styles.profileDetail}>{new Date(profile.dateOfBirth).toDateString()}</Text>
                        <Text style={styles.profileDetail}>{profile.gender}</Text>
                        <Text style={styles.profileDetail}>{profile.country}</Text>
                    </View>
                    {profile.bio ? (
                        profile.bio.length > 100 ? (
                            <>
                                <View style={styles.profileBioContainer}>
                                    {renderMessageContent(profile.bio.substring(0, 100) + '...')}
                                </View>
                                <TouchableOpacity style={styles.smallTransparentButton} onPress={handleViewFullBio}>
                                    <Text style={styles.smallButtonText}>Read Full Bio</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.profileBioContainer}>
                                {renderMessageContent(profile.bio)}
                            </View>
                        )
                    ) : (
                        <View style={styles.profileBioContainer}>
                            <Text style={styles.noBioText}>User has not written a bio.</Text>
                        </View>
                    )}
                </ScrollView>
                <Modal
                    visible={viewingProfilePicture}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={handleCloseProfilePicture}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.profileModalContent}>
                            {profile && (
                                <>
                                    <Image source={{ uri: `http://192.168.202.192:5000/${profile.profilePicture}` }} style={styles.profilePicture} />
                                    <TouchableOpacity style={styles.closeButton} onPress={handleCloseProfilePicture}>
                                        <Text style={styles.buttonText}>Close</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
                <Modal
                    visible={viewingAvatar}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={handleCloseAvatar}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.profileModalContent}>
                            {profile && (
                                <>
                                    <Image source={{ uri: `http://192.168.202.192:5000/${profile.avatar}` }} style={styles.profilePicture} />
                                    <TouchableOpacity style={styles.closeButton} onPress={handleCloseAvatar}>
                                        <Text style={styles.buttonText}>Close</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
                <Modal
                    visible={viewingFullBio}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={handleCloseFullBio}
                >
                    <View style={styles.modalContainer}>
                        <ScrollView contentContainerStyle={styles.profileModalContent}>
                            {profile && (
                                <>
                                    <ScrollView style={styles.profileBioContainer}>
                                        {renderMessageContent(profile.bio)}
                                    </ScrollView>
                                    <TouchableOpacity style={styles.closeButton} onPress={handleCloseFullBio}>
                                        <Text style={styles.buttonText}>Close</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </Modal>
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
    profileModalContent: {
        width: '90%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        maxHeight: '90%', // Increase the max height to 85%
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    profileNickname: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white',
    },
    onlineStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    onlineIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'green',
        marginRight: 5,
    },
    onlineText: {
        color: 'green',
        fontSize: 16,
    },
    profileUUID: {
        fontSize: 16,
        marginBottom: 10,
        color: 'white',
    },
    ratingContainer: {
        backgroundColor: '#ffcc00',
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    profileRating: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
    },
    highlightedRating: {
        color: '#ff0000',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    profileDetailsContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    profileDetail: {
        fontSize: 16,
        marginBottom: 10,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        textAlign: 'center',
    },
    profileBioContainer: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
        marginBottom: 10,
        marginTop: 10, // Add margin to the top
        padding: 10, // Add padding
    },
    profileBio: {
        fontSize: 16,
    },
    noBioText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    profilePicture: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    iconButton: {
        padding: 10,
    },
    smallTransparentButton: {
        width: '60%',
        padding: 5,
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    smallButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
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
    loadingText: {
        fontSize: 18,
        color: 'white',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});

export default ProfileViewModal;
