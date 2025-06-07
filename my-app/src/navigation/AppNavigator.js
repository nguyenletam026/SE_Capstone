import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/teacher/HomeScreen';
import ClassesScreen from '../screens/teacher/ClassesScreen';
import ClassDetailScreen from '../screens/teacher/ClassDetailScreen';
import StudentDetailScreen from '../screens/teacher/StudentDetailScreen';
import StressAnalysisScreen from '../screens/teacher/StressAnalysisScreen';
import ProfileScreen from '../screens/teacher/ProfileScreen';

// Import context
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ClassStack = createNativeStackNavigator();

// Classes Navigator (nested stack)
const ClassesNavigator = () => {
  return (
    <ClassStack.Navigator>
      <ClassStack.Screen 
        name="ClassesList" 
        component={ClassesScreen}
        options={{ headerShown: false }}
      />
      <ClassStack.Screen 
        name="ClassDetail" 
        component={ClassDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.className || 'Chi tiết lớp học',
        })}
      />
      <ClassStack.Screen 
        name="StudentDetail" 
        component={StudentDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.studentName || 'Chi tiết sinh viên',
        })}
      />
    </ClassStack.Navigator>
  );
};

// Main tab navigator for authenticated users
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1890ff',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Classes"
        component={ClassesNavigator}
        options={{
          title: 'Lớp học',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="StressAnalysis"
        component={StressAnalysisScreen}
        options={{
          title: 'Phân tích',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bar-chart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Root navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1890ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AppNavigator;