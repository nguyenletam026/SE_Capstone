import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/teacher/HomeScreen';
import ClassesNavigator from './ClassesNavigator';
import StressAnalysisScreen from '../screens/teacher/StressAnalysisScreen';
import ProfileScreen from '../screens/teacher/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1890ff',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12 },
        headerShown: false
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

export default MainTabNavigator;