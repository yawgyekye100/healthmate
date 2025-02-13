import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig'; // Import Firebase config
import PatientProfile from './PatientProfile';
import BookAppointment from './BookAppointment';
import RequestAmbulance from './RequestAmbulance';
import TrackMedication from './TrackMedication';
import MedicalRecords from './MedicalRecords';
import AskDoctor from './AskDoctor';

const Tab = createBottomTabNavigator();

export default function PatientDashboard() {
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid)); 
        if (userDoc.exists()) {
          setProfileImage(userDoc.data().profileImage);
        }
      }
    };

    fetchProfileImage();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Profile' && profileImage) {
            return (
              <Image
                source={{ uri: profileImage }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
              />
            );
          }

          let iconName;
          switch (route.name) {
            case 'Medical Records':
              iconName = 'document-text-outline';
              break;
            case 'Book Appointment':
              iconName = 'calendar-outline';
              break;
            case 'Request Ambulance':
              iconName = 'bus-outline';
              break;
            case 'Track Medication':
              iconName = 'medkit-outline';
              break;
              case 'Ask Doctor':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#32CD32',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Medical Records" component={MedicalRecords} />
      <Tab.Screen name="Book Appointment" component={BookAppointment} />
      <Tab.Screen name="Request Ambulance" component={RequestAmbulance} />
      <Tab.Screen name="Track Medication" component={TrackMedication} />
      <Tab.Screen name="Ask Doctor" component={AskDoctor} />
      <Tab.Screen name="Profile" component={PatientProfile} />
    </Tab.Navigator>
  );
}
