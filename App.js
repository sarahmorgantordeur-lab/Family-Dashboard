import 'react-native-url-polyfill/auto';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ListScreen from './src/screens/ListScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { session, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <AppProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="List" component={ListScreen} options={{ title: '' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
