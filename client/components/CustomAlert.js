import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CustomAlert = ({ visible, title, message, onConfirm, type }) => {
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        if (visible && type !== 'exit') {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            const timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    onConfirm();
                });
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [visible, type, fadeAnim, onConfirm]);

    const colors = type === 'error' ? ['#ff512f', '#dd2476'] : ['#4caf50', '#2e7d32'];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.smallModalContainer}>
                <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={colors}
                        style={styles.gradient}
                    >
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    smallModalContainer: {
        position: 'absolute',
        top: '10%',
        left: '10%',
        right: '10%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    gradient: {
        width: '100%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    message: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
    },
});

export default CustomAlert;
