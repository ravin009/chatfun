import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AuthContext from '../context/AuthContext';
import Avatar from '../components/Avatar';

const BlockListScreen = ({ navigation }) => {
    const { user, unblockUser } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBlockedUsers, setFilteredBlockedUsers] = useState(user.blockedUsers);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredBlockedUsers(user.blockedUsers);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = user.blockedUsers.filter(blockedUser =>
                (blockedUser.nickname && blockedUser.nickname.toLowerCase().includes(lowercasedQuery)) ||
                (blockedUser.uuid && blockedUser.uuid.toLowerCase().includes(lowercasedQuery))
            );
            setFilteredBlockedUsers(filtered);
        }
    }, [searchQuery, user.blockedUsers]);

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
            <Text style={styles.title}>Block List</Text>
            <TextInput
                style={styles.searchBox}
                placeholder="Search by Nickname or UUID"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888"
            />
            <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                {filteredBlockedUsers.length > 0 ? (
                    filteredBlockedUsers.map(blockedUser => (
                        <View key={blockedUser._id} style={styles.friendItem}>
                            <View style={styles.avatarContainer}>
                                <Avatar avatarPath={blockedUser.avatar} style={styles.avatar} />
                                <Text style={styles.friendNickname}>{blockedUser.nickname}</Text>
                            </View>
                            <TouchableOpacity style={styles.unblockButton} onPress={() => unblockUser(blockedUser._id)}>
                                <FontAwesome name="times" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyListText}>No blocked users found.</Text>
                )}
            </ScrollView>
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
    unblockButton: {
        backgroundColor: '#4caf50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyListText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default BlockListScreen;
