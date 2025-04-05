import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const ProfilePicture = ({ profilePicture, setProfilePicture }) => {
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setProfilePicture(uri);
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setProfilePicture(uri);
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
            {profilePicture && <Image source={{ uri: profilePicture }} style={styles.profilePicture} />}
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
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginLeft: 10,
    },
});

export default ProfilePicture;