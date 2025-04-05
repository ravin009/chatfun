import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const ExitConfirmationBox = ({ visible, onConfirm, onCancel }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onCancel}
        >
            <View style={styles.modalContainer}>
                <LinearGradient
                    colors={['#ff512f', '#dd2476']}
                    style={styles.modalContent}
                >
                    <Text style={styles.title}>Exit App</Text>
                    <Text style={styles.message}>Do you want to exit the app?</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={onCancel}>
                            <Text style={styles.buttonText}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={onConfirm}>
                            <Text style={styles.buttonText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
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
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ExitConfirmationBox;
