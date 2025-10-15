import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UserListScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>User List Screen</Text>
      <Button title="Open Chat" onPress={() => (navigation as any).navigate('Chat')} />
      <Button title="Back to Login" onPress={() => (navigation as any).navigate('Login')} />
    </View>
  );
}

