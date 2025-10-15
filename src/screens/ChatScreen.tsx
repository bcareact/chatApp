import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ChatScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Chat Screen</Text>
      <Button title="Back to Users" onPress={() => (navigation as any).navigate('Users')} />
    </View>
  );
}

