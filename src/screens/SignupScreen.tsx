import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SignupScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Signup Screen</Text>
      <Button title="Back to Login" onPress={() => (navigation as any).navigate('Login')} />
      <Button title="Enter App (Users)" onPress={() => (navigation as any).navigate('Users')} />
    </View>
  );
}


