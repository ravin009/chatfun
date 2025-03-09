import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ProfileOptionsScreen = ({ navigation }) => {
    const bubbles = Array.from({ length: 10 }).map(() => ({
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        size: Math.random() * 30 + 10,
        opacity: new Animated.Value(Math.random()),
    }));

    useEffect(() => {
        const animations = bubbles.map(bubble => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(bubble.y, {
                        toValue: -bubble.size,
                        duration: Math.random() * 3000 + 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(bubble.y, {
                        toValue: height + bubble.size,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );
        });

        animations.forEach(animation => animation.start());

        return () => {
            animations.forEach(animation => {
                if (animation) {
                    animation.stop();
                }
            });
        };
    }, [bubbles]);

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
            <Text style={styles.title}>Profile</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UpdateAvatar')}>
                    <LinearGradient
                        colors={['#6a11cb', '#2575fc']}
                        style={styles.buttonBackground}
                    >
                        <FontAwesome name="user-circle" size={24} color="white" />
                        <Text style={styles.buttonText}>Avatar</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UpdateProfilePicture')}>
                    <LinearGradient
                        colors={['#6a11cb', '#2575fc']}
                        style={styles.buttonBackground}
                    >
                        <FontAwesome name="image" size={24} color="white" />
                        <Text style={styles.buttonText}>Profile Picture</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UpdatePersonalInfo')}>
                    <LinearGradient
                        colors={['#6a11cb', '#2575fc']}
                        style={styles.buttonBackground}
                    >
                        <FontAwesome name="info-circle" size={24} color="white" />
                        <Text style={styles.buttonText}>Personal Information</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            {bubbles.map((bubble, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.bubble,
                        {
                            width: bubble.size,
                            height: bubble.size,
                            opacity: bubble.opacity,
                            transform: [
                                { translateX: bubble.x },
                                { translateY: bubble.y },
                            ],
                        },
                    ]}
                />
            ))}
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
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#fff',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
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
    bubble: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 123, 255, 0.3)',
        borderRadius: 50,
    },
});

export default ProfileOptionsScreen;
