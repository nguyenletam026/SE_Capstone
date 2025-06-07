import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import ClassesScreen from '../screens/teacher/ClassesScreen';
import ClassDetailScreen from '../screens/teacher/ClassDetailScreen';
import StudentDetailScreen from '../screens/teacher/StudentDetailScreen';

const Stack = createNativeStackNavigator();

const ClassesNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ClassesList" 
        component={ClassesScreen}
        options={{ 
          title: 'Danh sách lớp học',
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="ClassDetail" 
        component={ClassDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.className || 'Chi tiết lớp học',
        })}
      />
      <Stack.Screen 
        name="StudentDetail" 
        component={StudentDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.studentName || 'Chi tiết sinh viên',
        })}
      />
    </Stack.Navigator>
  );
};

export default ClassesNavigator;