import React from 'react';
import { View, StyleSheet } from 'react-native';

const SkeletonLoader = () => {
    return (
        <View style={styles.container}>
            {Array.from({ length: 10 }).map((_, index) => (
                <View key={index} style={styles.skeletonItem}>
                    <View style={styles.skeletonAvatar} />
                    <View style={styles.skeletonTextContainer}>
                        <View style={styles.skeletonText} />
                        <View style={styles.skeletonText} />
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    skeletonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginVertical: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
    },
    skeletonAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#c0c0c0',
    },
    skeletonTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    skeletonText: {
        height: 10,
        backgroundColor: '#c0c0c0',
        marginBottom: 5,
        borderRadius: 5,
    },
});

export default SkeletonLoader;
