import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, StatusBar } from 'react-native';
import RoomList from '../components/RoomList';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RoomListScreen = ({ navigation }) => {
    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <View style={styles.header}>
                <FontAwesome name="building" size={28} color="white" />
                <Text style={styles.title}>ROOMS</Text>
            </View>
            <RoomList navigation={navigation} />
            <TouchableOpacity style={styles.createRoomButton} onPress={() => navigation.navigate('CreateRoom')}>
                <LinearGradient
                    colors={['#ff512f', '#dd2476']}
                    style={styles.createRoomButtonBackground}
                >
                    <FontAwesome name="plus" size={24} color="white" />
                    <Text style={styles.createRoomButtonText}>Create Room</Text>
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Adjust for Android status bar
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40, // Add margin to move the header down
    },
    title: {
        fontSize: 28,
        marginLeft: 10,
        color: '#fff', // Make the title text white for better contrast
        fontWeight: 'bold',
    },
    createRoomButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        borderRadius: 50,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    createRoomButtonBackground: {
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
    createRoomButtonText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RoomListScreen;
