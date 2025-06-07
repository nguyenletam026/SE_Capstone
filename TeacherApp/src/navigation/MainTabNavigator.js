import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { ClassListScreen } from '../screens/ClassListScreen';
import { ClassDetailScreen } from '../screens/ClassDetailScreen';
import { StudentDetailScreen } from '../screens/StudentDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator for Classes
const ClassStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ClassList" 
        component={ClassListScreen} 
        options={{ title: 'My Classes' }}
      />
      <Stack.Screen 
        name="ClassDetail" 
        component={ClassDetailScreen} 
        options={{ title: 'Class Detail' }}
      />
      <Stack.Screen 
        name="StudentDetail" 
        component={StudentDetailScreen} 
        options={{ title: 'Student Detail' }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Classes') {
            iconName = focused ? 'school' : 'school-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Classes" 
        component={ClassStackNavigator}
        options={{ title: 'Classes' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
