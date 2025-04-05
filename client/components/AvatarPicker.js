import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const AvatarPicker = ({ avatar, setAvatar }) => {
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setAvatar(uri);
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setAvatar(uri);
        }
    };

    return (
        <View style={styles.imageContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                <FontAwesome name="image" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={takePhoto} style={styles.iconButton}>
                <FontAwesome name="camera" size={24} color="black" />
            </TouchableOpacity>
            {avatar && <Image source={{ uri: avatar }} style={styles.avatar} />}
        </View>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconButton: {
        marginHorizontal: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginLeft: 10,
    },
});

export default AvatarPicker;
