import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const MenuScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            {user && user.avatar ? (
                <Image
                    source={{ uri: `http://192.168.172.192:5000/${user.avatar}` }}
                    style={styles.avatar}
                    alt="User's avatar in a large square shape"
                />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>No Avatar</Text>
                </View>
            )}
            {user && (
                <Text style={styles.nickname}>{user.nickname}</Text>
            )}
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile')}>
                <FontAwesome name="user" size={24} color="#007bff" />
                <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('FriendList')}>
                <FontAwesome name="users" size={24} color="#007bff" />
                <Text style={styles.menuText}>Friend List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('BlockList')}>
                <FontAwesome name="ban" size={24} color="#ff4d4d" />
                <Text style={styles.menuText}>Block List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
                <FontAwesome name="cog" size={24} color="#007bff" />
                <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
                logout();
                navigation.navigate('Login'); // Redirect to login screen after logout
            }}>
                <FontAwesome name="sign-out" size={24} color="#ff4d4d" />
                <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 20,
        justifyContent: 'flex-start', // Align items to the start
        width: width / 2, // Take up half of the screen width
        height: height, // Take up the full height of the screen
        position: 'absolute',
        right: 0,
        top: 0,
    },
    avatar: {
        width: '100%',
        aspectRatio: 1, // Ensure the avatar is square
        borderRadius: 10,
        marginBottom: 10, // Adjust margin as needed
    },
    avatarPlaceholder: {
        width: '100%',
        aspectRatio: 1, // Ensure the placeholder is square
        borderRadius: 10,
        marginBottom: 10, // Adjust margin as needed
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        color: '#888',
        fontSize: 18,
    },
    nickname: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20, // Adjust margin as needed
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginVertical: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
    },
    menuText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 10,
    },
});

export default MenuScreen;
