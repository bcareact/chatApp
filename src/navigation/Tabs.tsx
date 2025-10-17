import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserListScreen from '../screens/UserListScreen';
import ActiveChatsScreen from '../screens/ActiveChatsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { NavigationContainerRef } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Chats" component={ActiveChatsScreen} options={{ title: 'Chats' }} />
      <Tab.Screen name="NewChat" component={UserListScreen} options={{ title: 'New Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}


