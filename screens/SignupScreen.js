// /screens/SignupScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'We need permission to access your photo library to select a profile picture.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image Picker Error:', error);
      Alert.alert('Error', 'Something went wrong while selecting the image.');
    }
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password || !location) {
      Alert.alert('Missing Fields', 'Please fill in all the fields.');
      return;
    }

   {/* if (!profileImage) {
      Alert.alert('Profile Image Required', 'Please select a profile image.');
      return;
    }
  */}
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Upload profile image to Firebase Storage
      let imageUrl = '';
      if (profileImage) {
        const response = await fetch(profileImage);
        const blob = await response.blob();
        const imageRef = ref(storage, `profiles/${userId}`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Save user details to Firestore
      await setDoc(doc(db, 'users', userId), {
        uid: userId,
        fullName,
        email,
        password,
        location,
        profileImage: imageUrl || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg',
        userType: 'patient',
        createdAt: new Date().toISOString(),
      });

      // Sign out the user and navigate to the login screen
      await signOut(auth);
      Alert.alert('Success', 'Account created successfully. Please log in.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Signup Error:', error);
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      {/* Profile Image Picker */}
      <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require('../assets/images/default_profile.jpg')
          }
          style={styles.profileImage}
        />
        <View style={styles.editIconContainer}>
          <Ionicons name="camera" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* Input Fields */}
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />

      {/* Signup Button */}
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity onPress={handleSignup} style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}

      {/* Navigate to Login */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
        style={{ marginTop: 20 }}
      >
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={{ color: '#007BFF', fontWeight: 'bold' }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    alignSelf: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EAEAEA',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007BFF',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
});
