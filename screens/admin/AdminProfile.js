// /screens/admin/AdminProfile.js
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export default function AdminProfile() {
  const navigation = useNavigation();

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    location: '',
    profileImage: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }
      } catch (error) {
        console.log('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to fetch profile data.');
      }
    };
    fetchProfile();
  }, [user]);

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera roll permissions are required to change the profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setNewProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const uploadImageAsync = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(fileRef, blob);

      blob.close();

      const downloadUrl = await getDownloadURL(fileRef);
      return downloadUrl;
    } catch (error) {
      console.log('Error uploading image:', error);
      throw error;
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      let imageUrl = profile.profileImage;
      if (newProfileImage) {
        imageUrl = await uploadImageAsync(newProfileImage);
      }
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: profile.fullName,
        location: profile.location,
        profileImage: imageUrl,
      });
      Alert.alert('Success', 'Profile updated successfully!');
      setNewProfileImage(null);
    } catch (error) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged Out', 'You have logged out successfully!');
      navigation.replace('Onboarding');
    } catch (error) {
      console.log('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Image
          source={
            newProfileImage
              ? { uri: newProfileImage }
              : profile.profileImage
              ? { uri: profile.profileImage }
              : require('../../assets/images/default_profile.jpg')
          }
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editIcon} onPress={handlePickImage}>
          <Ionicons name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        value={profile.fullName}
        onChangeText={(text) => setProfile({ ...profile, fullName: text })}
        placeholder="Full Name"
      />
      <TextInput
        style={styles.input}
        value={profile.email}
        placeholder="Email"
        keyboardType="email-address"
        editable={false}
      />
      <TextInput
        style={styles.input}
        value={profile.location}
        onChangeText={(text) => setProfile({ ...profile, location: text })}
        placeholder="Location"
      />

      <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
      {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
        <Text style={styles.updateButtonText}>Update Profile</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileImageContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 30,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#32CD32',
  },
  editIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: '#32CD32',
    borderRadius: 20,
    padding: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 25,
    padding: 10,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#32CD32',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

