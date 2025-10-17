import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Provider as JotaiProvider } from 'jotai';
import 'nativewind';
import './global.css';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <JotaiProvider>
      <View className="flex-1">
        <RootNavigator />
        <StatusBar style="auto" />
      </View>
    </JotaiProvider>
  );
}
