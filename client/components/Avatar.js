import React, { memo } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';

const Avatar = ({ avatarPath, isOnline }) => {
    const getAvatarUrl = (avatarPath) => {
        if (!avatarPath) {
            return 'https://placehold.co/40x40'; // Fallback URL if avatar is not defined
        }
        return `https://chatfun-backend.onrender.com/${avatarPath.replace(/\\/g, '/')}`;
    };

    const avatarUrl = getAvatarUrl(avatarPath);
    console.log('Avatar URL:', avatarUrl); // Log the avatar URL

    return (
        <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            {!avatarPath && <Text style={styles.placeholderText}>No Avatar</Text>}
            {isOnline && <View style={styles.onlineIndicator} />}
        </View>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        position: 'relative',
        width: 40,
        height: 40,
        borderRadius: 5,
        marginRight: 10,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    placeholderText: {
        position: 'absolute',
        color: '#999',
        fontSize: 10,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'green',
        borderWidth: 1,
        borderColor: 'white',
    },
});

export default memo(Avatar, (prevProps, nextProps) => prevProps.avatarPath === nextProps.avatarPath && prevProps.isOnline === nextProps.isOnline);
