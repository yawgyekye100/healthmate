import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

import PatientDashboard from '../screens/patient/PatientDashboard';

import DoctorDashboard from '../screens/doctor/DoctorDashboard';

import AdminDashboard from '../screens/admin/AdminDashboard';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      {/* Patient Portal */}
      <Stack.Screen name="PatientDashboard" component={PatientDashboard} options={{ headerShown: false }} />
      {/* Doctor Portal */}
      <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} options={{ headerShown: false }} />
      {/* Admin Portal */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
