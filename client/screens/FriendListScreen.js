import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AuthContext from '../context/AuthContext';
import Avatar from '../components/Avatar';
import ProfileViewModal from '../components/ProfileViewModal'; // Import ProfileViewModal

const FriendListScreen = ({ navigation }) => {
    const { user, removeFriend, blockUser, unblockUser, isBlocked } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFriends, setFilteredFriends] = useState(user.friends);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredFriends(user.friends);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = user.friends.filter(friend =>
                (friend.nickname && friend.nickname.toLowerCase().includes(lowercasedQuery)) ||
                (friend.uuid && friend.uuid.toLowerCase().includes(lowercasedQuery))
            );
            setFilteredFriends(filtered);
        }
    }, [searchQuery, user.friends]);

    const handleViewProfile = (friendId) => {
        setSelectedUserId(friendId);
        setProfileModalVisible(true);
    };

    const handlePrivateMessage = (friend) => {
        navigation.navigate('PrivateChat', { userId: friend._id, nickname: friend.nickname, avatar: friend.avatar });
    };

    const handleBlockUser = async (friend) => {
        if (isBlocked(friend._id)) {
            await unblockUser(friend._id);
        } else {
            await blockUser(friend._id);
        }
    };

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <Image
                source={require('../assets/ChatFun_Logo.png')}
                style={styles.logo}
                alt="Chatify logo with a 1:1 ratio"
            />
            <Text style={styles.title}>Friend List</Text>
            <TextInput
                style={styles.searchBox}
                placeholder="Search by Nickname or UUID"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888"
            />
            <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                {filteredFriends.length > 0 ? (
                    filteredFriends.map(friend => (
                        <View key={friend._id}>
                            <View style={styles.friendItem}>
                                <View style={styles.avatarContainer}>
                                    <Avatar avatarPath={friend.avatar} style={styles.avatar} />
                                    <Text style={styles.friendNickname}>{friend.nickname}</Text>
                                </View>
                                <View style={styles.iconContainer}>
                                    <TouchableOpacity onPress={() => setSelectedFriend(selectedFriend === friend._id ? null : friend._id)}>
                                        <FontAwesome name={selectedFriend === friend._id ? "chevron-up" : "chevron-down"} size={16} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.removeButton} onPress={() => removeFriend(friend._id)}>
                                        <FontAwesome name="times" size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {selectedFriend === friend._id && (
                                <View style={styles.optionsContainer}>
                                    <TouchableOpacity style={styles.optionButton} onPress={() => handleViewProfile(friend._id)}>
                                        <FontAwesome name="user" size={16} color="blue" />
                                        <Text style={styles.optionText}>View Profile</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.optionButton} onPress={() => handlePrivateMessage(friend)}>
                                        <FontAwesome name="envelope" size={16} color="purple" />
                                        <Text style={styles.optionText}>Private Message</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.optionButton} onPress={() => handleBlockUser(friend)}>
                                        <FontAwesome name={isBlocked(friend._id) ? "unlock" : "ban"} size={16} color={isBlocked(friend._id) ? "green" : "red"} />
                                        <Text style={styles.optionText}>{isBlocked(friend._id) ? "Unblock User" : "Block User"}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyListText}>No friends found.</Text>
                )}
            </ScrollView>
            {selectedUserId && (
                <ProfileViewModal
                    visible={profileModalVisible}
                    onClose={() => setProfileModalVisible(false)}
                    userId={selectedUserId}
                    onSendMessage={(recipientId, recipientGender, recipientNickname) => {
                        setProfileModalVisible(false);
                        handlePrivateMessage({ _id: recipientId, nickname: recipientNickname, avatar: filteredFriends.find(friend => friend._id === recipientId).avatar });
                    }}
                />
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 100, // Adjust the size as needed
        height: 100, // Ensure the height matches the width for a 1:1 ratio
        marginBottom: 20, // Add some space below the logo
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#fff', // Make the title text white for better contrast
    },
    searchBox: {
        width: '80%',
        alignSelf: 'center',
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 20, // Add margin to the bottom
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        textAlign: 'center', // Center the text
        fontSize: 16, // Increase font size
    },
    scrollViewContent: {
        flexGrow: 1,
        width: '100%',
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 15,
        marginVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        position: 'relative', // Add position relative to position the remove button
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    friendNickname: {
        marginLeft: 10,
        fontSize: 16,
        color: '#fff',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    removeButton: {
        backgroundColor: '#ff4d4d',
        padding: 5, // Reduce padding to make the button smaller
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10, // Add margin to the left of the remove button
    },
    emptyListText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
    optionsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginVertical: 5,
    },
    optionText: {
        fontSize: 16,
        marginLeft: 10,
        color: '#fff',
    },
});

export default FriendListScreen;
