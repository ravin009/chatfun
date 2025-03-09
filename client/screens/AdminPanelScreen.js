import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdminPanelScreen = ({ navigation }) => {
    const { user, isAdmin } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [listType, setListType] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const res = await axios.get('http://192.168.172.192:5000/api/user');
                setUsers(res.data);
            } catch (err) {
                console.error('Error fetching users:', err.response ? err.response.data : err.message);
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const handleSetRole = async (userId, role, action) => {
        try {
            const token = await AsyncStorage.getItem('token');
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            await axios.put('http://192.168.172.192:5000/api/admin/set-role', { userId, role, action });
            Alert.alert('Success', `Role ${action === 'add' ? 'added to' : 'removed from'} user.`);
            setModalVisible(false);
        } catch (err) {
            console.error('Error setting role:', err.response ? err.response.data : err.message);
            Alert.alert('Error', 'Error setting role.');
        }
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity style={styles.userItem} onPress={() => { setSelectedUser(item); setModalVisible(true); }}>
            <Text style={styles.userNickname}>{item.nickname}</Text>
        </TouchableOpacity>
    );

    const renderList = (filterRole) => (
        <FlatList
            data={users.filter(user => user.roles.includes(filterRole))}
            renderItem={renderUserItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
        />
    );

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
            <Text style={styles.title}>Admin Panel</Text>
            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : (
                <>
                    {!listType ? (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.listButton} onPress={() => setListType('Moderator')}>
                                <LinearGradient
                                    colors={['#6a11cb', '#2575fc']}
                                    style={styles.buttonBackground}
                                >
                                    <Text style={styles.buttonText}>Moderators</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.listButton} onPress={() => setListType('Super Moderator')}>
                                <LinearGradient
                                    colors={['#6a11cb', '#2575fc']}
                                    style={styles.buttonBackground}
                                >
                                    <Text style={styles.buttonText}>Super Moderators</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.listButton} onPress={() => setListType('Co-Admin')}>
                                <LinearGradient
                                    colors={['#6a11cb', '#2575fc']}
                                    style={styles.buttonBackground}
                                >
                                    <Text style={styles.buttonText}>Co-Admins</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.listContainer}>
                            <Text style={styles.listTitle}>{listType}</Text>
                            {renderList(listType)}
                            <TouchableOpacity style={styles.backButton} onPress={() => setListType(null)}>
                                <LinearGradient
                                    colors={['#6a11cb', '#2575fc']}
                                    style={styles.buttonBackground}
                                >
                                    <Text style={styles.buttonText}>Back</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
            {selectedUser && (
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{selectedUser.nickname}</Text>
                            {selectedUser.roles.includes('Moderator') ? (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(selectedUser._id, 'Moderator', 'remove')}>
                                    <Text style={styles.optionText}>Remove Moderator</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(selectedUser._id, 'Moderator', 'add')}>
                                    <Text style={styles.optionText}>Set Moderator</Text>
                                </TouchableOpacity>
                            )}
                            {selectedUser.roles.includes('Super Moderator') ? (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(selectedUser._id, 'Super Moderator', 'remove')}>
                                    <Text style={styles.optionText}>Remove Super Moderator</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(selectedUser._id, 'Super Moderator', 'add')}>
                                    <Text style={styles.optionText}>Set Super Moderator</Text>
                                </TouchableOpacity>
                            )}
                            {selectedUser.roles.includes('Co-Admin') ? (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(selectedUser._id, 'Co-Admin', 'remove')}>
                                    <Text style={styles.optionText}>Remove Co-Admin</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(selectedUser._id, 'Co-Admin', 'add')}>
                                    <Text style={styles.optionText}>Set Co-Admin</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
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
        width: 150, // Adjust the size as needed
        height: 150, // Ensure the height matches the width for a 1:1 ratio
        marginBottom: 20, // Add some space below the logo
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        color: '#fff', // Make the title text white for better contrast
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    listButton: {
        width: '80%',
        marginBottom: 15, // Add some space between the buttons
    },
    buttonBackground: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 25, // Make the corners rounded
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10, // Add some space between the icon and the text
    },
});

export default AdminPanelScreen;