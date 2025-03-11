import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../styles/ChatScreenStyles';
import AuthContext from '../context/AuthContext';

const UserOptionsModal = ({
    visible,
    onClose,
    userId,
    isFriend,
    isBlocked,
    isReadOnly,
    isBanned, // Add this line
    handleAddFriend,
    handleRemoveFriend,
    handleBlockUser,
    handleUnblockUser,
    handleViewProfile,
    handlePrivateMessage,
    handleSetReadOnly,
    handleRemoveReadOnly,
    handleBanUser, // Add this line
    handleUnbanUser, // Add this line
    isAdmin,
    handleSetRole,
    userRoles,
    currentUserRoles,
    isRoomOwner,
    isRoomCreator,
    currentRoomId,
    targetUserRoomId
}) => {
    const { setAlertTitle, setAlertMessage, setAlertType, setAlertVisible } = useContext(AuthContext);

    const handleSetReadOnlyClick = async () => {
        const restrictedRoles = ['Admin', 'Moderator', 'Super Moderator', 'Co-Admin'];
        const isCurrentUserRestricted = currentUserRoles.some(role => restrictedRoles.includes(role));
        const isTargetUserRestricted = userRoles.some(role => restrictedRoles.includes(role));

        try {
            // Admins can set anyone to read-only mode
            if (isAdmin) {
                await handleSetReadOnly(userId);
                setAlertTitle('Success');
                setAlertMessage('User set to read-only mode');
                setAlertType('success');
                setAlertVisible(true);
                return;
            }

            // Check if the target user has restricted roles
            if (isTargetUserRestricted) {
                throw new Error('You cannot set a user with Admin, Moderator, Super Moderator, or Co-Admin roles to read-only mode');
            } else {
                await handleSetReadOnly(userId);
                setAlertTitle('Success');
                setAlertMessage('User set to read-only mode');
                setAlertType('success');
                setAlertVisible(true);
            }
        } catch (error) {
            setAlertTitle('Error');
            setAlertMessage(error.message || 'An error occurred while setting read-only mode');
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const handleRemoveReadOnlyClick = async () => {
        const restrictedRoles = ['Admin', 'Moderator', 'Super Moderator', 'Co-Admin'];
        const isCurrentUserRestricted = currentUserRoles.some(role => restrictedRoles.includes(role));
        const isTargetUserRestricted = userRoles.some(role => restrictedRoles.includes(role));

        try {
            // Admins can remove anyone from read-only mode
            if (isAdmin) {
                await handleRemoveReadOnly(userId);
                setAlertTitle('Success');
                setAlertMessage('User removed from read-only mode');
                setAlertType('success');
                setAlertVisible(true);
                return;
            }

            // Check if the target user has restricted roles
            if (isTargetUserRestricted) {
                throw new Error('You cannot remove read-only mode for a user with Admin, Moderator, Super Moderator, or Co-Admin roles');
            } else {
                await handleRemoveReadOnly(userId);
                setAlertTitle('Success');
                setAlertMessage('User removed from read-only mode');
                setAlertType('success');
                setAlertVisible(true);
            }
        } catch (error) {
            setAlertTitle('Error');
            setAlertMessage(error.message || 'An error occurred while removing read-only mode');
            setAlertType('error');
            setAlertVisible(true);
        }
    };

    const handleBlockUserClick = () => {
        if (userRoles.includes('Admin')) {
            setAlertTitle('Error');
            setAlertMessage('You cannot block an admin');
            setAlertType('error');
            setAlertVisible(true);
        } else {
            handleBlockUser(userId);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    {isFriend ? (
                        <TouchableOpacity style={styles.optionButton} onPress={() => handleRemoveFriend(userId?.toString())}>
                            <FontAwesome name="user-times" size={16} color="red" />
                            <Text style={styles.optionText}>Remove Friend</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.optionButton} onPress={() => handleAddFriend(userId?.toString())}>
                            <FontAwesome name="user-plus" size={16} color="green" />
                            <Text style={styles.optionText}>Add Friend</Text>
                        </TouchableOpacity>
                    )}
                    {isBlocked ? (
                        <TouchableOpacity style={styles.optionButton} onPress={() => handleUnblockUser(userId?.toString())}>
                            <FontAwesome name="unlock" size={16} color="green" />
                            <Text style={styles.optionText}>Unblock User</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.optionButton} onPress={handleBlockUserClick}>
                            <FontAwesome name="ban" size={16} color="red" />
                            <Text style={styles.optionText}>Block User</Text>
                        </TouchableOpacity>
                    )}
                    {isReadOnly ? (
                        <TouchableOpacity style={styles.optionButton} onPress={handleRemoveReadOnlyClick}>
                            <FontAwesome name="unlock" size={16} color="green" />
                            <Text style={styles.optionText}>Remove Read-Only</Text>
                        </TouchableOpacity>
                    ) : (
                        (isAdmin || currentUserRoles.includes('Moderator') || currentUserRoles.includes('Super Moderator') || currentUserRoles.includes('Co-Admin') || isRoomOwner || isRoomCreator) && (
                            <TouchableOpacity style={styles.optionButton} onPress={handleSetReadOnlyClick}>
                                <FontAwesome name="lock" size={16} color="red" />
                                <Text style={styles.optionText}>Set Read-Only</Text>
                            </TouchableOpacity>
                        )
                    )}
                    {isBanned ? (
                        <TouchableOpacity style={styles.optionButton} onPress={async () => {
                            try {
                                await handleUnbanUser(userId?.toString());
                            } catch (error) {
                                setAlertTitle('Error');
                                setAlertMessage(error.response && error.response.data && error.response.data.error ? error.response.data.error : 'An error occurred while unbanning the user.');
                                setAlertType('error');
                                setAlertVisible(true);
                            }
                        }}>
                            <FontAwesome name="unlock" size={16} color="green" />
                            <Text style={styles.optionText}>Unban User</Text>
                        </TouchableOpacity>
                    ) : (
                        (isAdmin || currentUserRoles.includes('Super Moderator') || currentUserRoles.includes('Co-Admin')) && (
                            <TouchableOpacity style={styles.optionButton} onPress={async () => {
                                try {
                                    await handleBanUser(userId?.toString());
                                } catch (error) {
                                    setAlertTitle('Error');
                                    setAlertMessage(error.response && error.response.data && error.response.data.error ? error.response.data.error : 'An error occurred while banning the user.');
                                    setAlertType('error');
                                    setAlertVisible(true);
                                }
                            }}>
                                <FontAwesome name="ban" size={16} color="red" />
                                <Text style={styles.optionText}>Ban User</Text>
                            </TouchableOpacity>
                        )
                    )}
                    <TouchableOpacity style={styles.optionButton} onPress={() => handleViewProfile(userId?.toString())}>
                        <FontAwesome name="user" size={16} color="blue" />
                        <Text style={styles.optionText}>View Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionButton} onPress={() => handlePrivateMessage(userId?.toString())}>
                        <FontAwesome name="envelope" size={16} color="purple" />
                        <Text style={styles.optionText}>Private Message</Text>
                    </TouchableOpacity>
                    {isAdmin && (
                        <>
                            {userRoles.includes('Moderator') ? (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(userId?.toString(), 'Moderator', 'remove')}>
                                    <FontAwesome name="user" size={16} color="red" />
                                    <Text style={styles.optionText}>Remove Moderator</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(userId?.toString(), 'Moderator', 'add')}>
                                    <FontAwesome name="user" size={16} color="orange" />
                                    <Text style={styles.optionText}>Set Moderator</Text>
                                </TouchableOpacity>
                            )}
                            {userRoles.includes('Super Moderator') ? (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(userId?.toString(), 'Super Moderator', 'remove')}>
                                    <FontAwesome name="user" size={16} color="red" />
                                    <Text style={styles.optionText}>Remove Super Moderator</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(userId?.toString(), 'Super Moderator', 'add')}>
                                    <FontAwesome name="user" size={16} color="orange" />
                                    <Text style={styles.optionText}>Set Super Moderator</Text>
                                </TouchableOpacity>
                            )}
                            {userRoles.includes('Co-Admin') ? (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(userId?.toString(), 'Co-Admin', 'remove')}>
                                    <FontAwesome name="user" size={16} color="red" />
                                    <Text style={styles.optionText}>Remove Co-Admin</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.optionButton} onPress={() => handleSetRole(userId?.toString(), 'Co-Admin', 'add')}>
                                    <FontAwesome name="user" size={16} color="orange" />
                                    <Text style={styles.optionText}>Set Co-Admin</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default UserOptionsModal;
