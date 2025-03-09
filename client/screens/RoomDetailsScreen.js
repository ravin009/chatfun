import React from 'react';
import { View, StyleSheet } from 'react-native';
import RoomDetails from '../components/RoomDetails';

const RoomDetailsScreen = ({ route, navigation }) => {
    return (
        <View style={styles.container}>
            <RoomDetails route={route} navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});

export default RoomDetailsScreen;
