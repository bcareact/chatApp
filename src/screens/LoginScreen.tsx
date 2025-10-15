import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Login Screen</Text>
      <Button title="Go to Signup" onPress={() => (navigation as any).navigate('Signup')} />
      <Button title="Enter App (Users)" onPress={() => (navigation as any).navigate('Users')} />
    </View>
  );
}


