import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#17202a',
    },
    scrollView: {
        width: '100%',
        marginBottom: 60, // Adjust to ensure the last message is not overlapped by the input container
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        width: '100%',
    },
    messageText: {
        flex: 1,
        flexWrap: 'wrap',
        marginRight: 10, // Add margin to the right to prevent overflow
        fontWeight: 'bold', // Make chat text bold
        wordBreak: 'break-word', // Ensure long words break to the next line
        whiteSpace: 'pre-wrap', // Preserve spaces and line breaks
        paddingRight: 30, // Add padding to the right to ensure no characters are cut off
    },
    nickname: {
        fontWeight: 'bold', // Make nickname bold
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#2c3e50', // Darker background for the input container
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 60, // Decrease the height of the container
    },
    input: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        textAlignVertical: 'top', // Ensure text starts from the top
        color: 'white', // Set input text color to white
        backgroundColor: '#34495e', // Darker background for the input box
        marginRight: 10, // Add margin to the right of the input box
    },
    inputPlaceholder: {
        color: 'white', // Set placeholder text color to white
    },
    iconButton: {
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
    hamburgerIcon: {
        position: 'absolute',
        top: 30, // Adjust this value to move the icon down
        right: 10,
        padding: 10,
    },
    menuContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: width / 2, // Take up half of the screen width
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1000,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        paddingVertical: 20, // Add padding to the top and bottom
    },
    modalContent: {
        width: width * 0.9,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        maxHeight: '80%', // Ensure the modal content does not exceed 80% of the screen height
    },
    profileModalContent: {
        width: width * 0.95, // Increase the width of the modal
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        maxHeight: '85%', // Increase the height of the modal
        justifyContent: 'center', // Center the content vertically
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 20,
    },
    profileNickname: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'white',
    },
    onlineStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    onlineIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'green',
        marginRight: 5,
    },
    onlineText: {
        color: 'green',
        fontSize: 16,
    },
    ratingContainer: {
        backgroundColor: '#ffcc00',
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    profileRating: {
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold',
    },
    highlightedRating: {
        color: '#ff0000',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    profileDetailsContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    profileDetail: {
        fontSize: 16,
        marginBottom: 10,
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        textAlign: 'center',
    },
    profileButton: {
        width: '80%',
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    smallTransparentButton: {
        width: '60%',
        padding: 5,
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    smallButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    profileButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    profileBioContainer: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f5f5f5',
        marginBottom: 10,
        marginTop: 10, // Add margin to the top
        padding: 10, // Add padding
    },
    profileBio: {
        fontSize: 16,
    },
    profilePicture: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 5,
        marginRight: 10,
    },
    friendNickname: {
        marginLeft: 10,
        color: 'white',
        fontSize: 14,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    removeButton: {
        backgroundColor: '#ff4d4d',
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unblockButton: {
        backgroundColor: '#4caf50',
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    closeIconButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        padding: 5,
        alignSelf: 'flex-end',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginVertical: 5,
        width: '100%',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 18,
        marginLeft: 10,
        color: 'white',
    },
    userOptions: {
        position: 'absolute',
        top: 50,
        right: 10,
        backgroundColor: 'white', // No transparency
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    dragCornerTopLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 30,
        height: 30,
        backgroundColor: 'transparent',
    },
    dragCornerTopRight: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 30,
        height: 30,
        backgroundColor: 'transparent',
    },
    dragCornerBottomLeft: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: 30,
        height: 30,
        backgroundColor: 'transparent',
    },
    dragCornerBottomRight: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 30,
        height: 30,
        backgroundColor: 'transparent',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    iconButton: {
        padding: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
    },
    modalText: {
        fontSize: 16,
        color: 'white',
        marginBottom: 10,
    },
    emptyListText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
    },
    inboxIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#007bff',
        borderRadius: 50,
        padding: 10,
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        backgroundColor: 'red',
        borderRadius: 5,
    },
    roomIcon: {
        position: 'absolute',
        top: 10,
        left: '50%',
        marginLeft: -12, // Half the width of the icon to center it
        backgroundColor: '#007bff',
        borderRadius: 50,
        padding: 10,
    },
    infoIcon: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#007bff',
        borderRadius: 50,
        padding: 10,
    },
    subMenu: {
        marginLeft: 20,
        marginTop: 10,
    },
    subMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    pencilIcon: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#007bff',
        borderRadius: 50,
        padding: 10,
    },
    closeIcon: {
        padding: 10,
        backgroundColor: '#ff4d4d',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
    },
});

export default styles;
