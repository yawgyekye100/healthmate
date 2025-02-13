import React, { useEffect, useState } from 'react';
import {View, Text, Image, TouchableOpacity, Alert, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';


const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [activeButton, setActiveButton] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userType = userData.userType;

            // Redirect to the appropriate portal based on user type
            if (userType === 'patient') {
              Alert.alert(`Welcome back ${userData.fullName}`, 'You have already logged in');
              navigation.replace('PatientDashboard');
            } else if (userType === 'admin') {
              Alert.alert(`Welcome back Super Admin ${userData.fullName}`, 'You have already logged in');
              navigation.replace('AdminDashboard');
            } else if (userType === 'doctor') {
              Alert.alert(`Welcome back Doctor ${userData.fullName}`, 'You have already logged in');
              navigation.replace('DoctorDashboard');
            }

          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  const handleButtonPress = (button) => {
    setActiveButton(button);
  };

  const handleButtonRelease = () => {
    setActiveButton(null);
  };


  return (
    <ImageBackground
      source={require('../assets/images/background.webp')}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.7 }} // Background image opacity
    >
      <View style={styles.overlay} />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo1.jpg')}
          style={styles.logo}
        />
      </View>

      <Text style={styles.welcomeText}>Welcome to Health Mate</Text>
      <Text style={styles.subText}>Your health, simplified. Track your wellness, connect with experts, and take charge of your journey—all in one place!</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.getStartedButton,
            activeButton === 'signup' && styles.activeButton
          ]}
          onPressIn={() => handleButtonPress('signup')}
          onPressOut={handleButtonRelease}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.getStartedButton,
            activeButton === 'login' && styles.activeButton
          ]}
          onPressIn={() => handleButtonPress('login')}
          onPressOut={handleButtonRelease}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark overlay for a clean contrast
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
  //  backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparent overlay for logo
    backgroundColor: 'white', // Transparent overlay for logo
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#fff', // Border for logo container
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 50,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    width: width * 0.8,
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.5)', // Gray background with transparency
    paddingVertical: 15,
    borderRadius: 30,
    marginVertical: 5,
    width: '100%',
  },
  activeButton: {
    backgroundColor: '#007BFF', // Blue background when active
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
