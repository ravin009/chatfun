import React, { useEffect, useCallback } from 'react';
import { View, Image, StyleSheet, BackHandler } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

const ImageViewScreen = ({ route, navigation }) => {
    const { fileName } = route.params;

    const preventScreenCapture = useCallback(async () => {
        await ScreenCapture.preventScreenCaptureAsync();
    }, []);

    const allowScreenCapture = useCallback(async () => {
        await ScreenCapture.allowScreenCaptureAsync();
    }, []);

    useEffect(() => {
        preventScreenCapture();

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigation.goBack();
            return true;
        });

        return () => {
            allowScreenCapture();
            backHandler.remove();
        };
    }, [preventScreenCapture, allowScreenCapture, navigation]);

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: `http://192.168.172.192:5000/uploads/${fileName}` }}
                style={styles.image}
                alt={`Image file named ${fileName}`}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default ImageViewScreen;
