import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ChatScreen from './screens/ChatScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ProfileOptionsScreen from './screens/ProfileOptionsScreen';
import UpdateAvatarScreen from './screens/UpdateAvatarScreen';
import UpdateProfilePictureScreen from './screens/UpdateProfilePictureScreen';
import UpdatePersonalInfoScreen from './screens/UpdatePersonalInfoScreen';
import InboxScreen from './screens/InboxScreen';
import PrivateChatScreen from './screens/PrivateChatScreen';
import ColorSettingsScreen from './screens/ColorSettingsScreen';
import RoomListScreen from './screens/RoomListScreen';
import RoomDetailsScreen from './screens/RoomDetailsScreen';
import CreateRoomScreen from './screens/CreateRoomScreen';
import SettingsScreen from './screens/SettingsScreen';
import EmailSettingsScreen from './screens/EmailSettingsScreen';
import PasswordSettingsScreen from './screens/PasswordSettingsScreen';
import PrivacySettingsScreen from './screens/PrivacySettingsScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import FriendListScreen from './screens/FriendListScreen';
import BlockListScreen from './screens/BlockListScreen';
import MenuScreen from './screens/MenuScreen';
import ImageViewScreen from './screens/ImageViewScreen'; // Import the ImageViewScreen
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import overrideConsole from './utils/consoleOverride'; // Import the console override utility

 // Call the overrideConsole function
 overrideConsole();


const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <AuthProvider>
                <RoomProvider>
                    <Stack.Navigator initialRouteName="Login">
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Profile" component={ProfileOptionsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="UpdateAvatar" component={UpdateAvatarScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="UpdateProfilePicture" component={UpdateProfilePictureScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="UpdatePersonalInfo" component={UpdatePersonalInfoScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Inbox" component={InboxScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="PrivateChat" component={PrivateChatScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ColorSettings" component={ColorSettingsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="RoomList" component={RoomListScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="RoomDetails" component={RoomDetailsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="CreateRoom" component={CreateRoomScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="EmailSettings" component={EmailSettingsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="PasswordSettings" component={PasswordSettingsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="AdminPanel" component={AdminPanelScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="FriendList" component={FriendListScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="BlockList" component={BlockListScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ImageView" component={ImageViewScreen} options={{ headerShown: false }} />
                    </Stack.Navigator>
                </RoomProvider>
            </AuthProvider>
        </NavigationContainer>
    );
};

export default App;
