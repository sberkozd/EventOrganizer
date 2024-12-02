import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, addDoc, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';

const EventDetailScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [creatorEmail, setCreatorEmail] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchCreatorEmail();
    checkIfUserIsCreator();
    checkIfEventIsFavorited();
  }, []);

  const fetchCreatorEmail = async () => {
    try {
      const userDocRef = doc(db, 'users', event.createdByUser);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setCreatorEmail(userDoc.data().email);
      } else {
        setCreatorEmail('Unknown user');
        console.error('No such user!');
      }
    } catch (error) {
      console.error('Error fetching creator email:', error);
      setCreatorEmail('Error fetching email');
    }
  };

  const checkIfUserIsCreator = () => {
    const userId = auth.currentUser.uid;
    setIsCreator(userId === event.createdByUser);
  };

  const checkIfEventIsFavorited = async () => {
    try {
      const userId = auth.currentUser.uid;
      const favoritesCollection = collection(db, 'favorites');
      const favoritesQuery = query(favoritesCollection, where('userId', '==', userId), where('eventId', '==', event.id));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      setIsFavorited(!favoritesSnapshot.empty);
    } catch (error) {
      console.error('Error checking if event is favorited:', error);
    }
  };

  const addToFavorites = async () => {
    try {
      const userId = auth.currentUser.uid;
      const favoritesCollection = collection(db, 'favorites');
      await addDoc(favoritesCollection, { eventId: event.id, userId });
      Alert.alert('Success', 'Event added to favorites.');
      setIsFavorited(true);
    } catch (error) {
      console.error('Error adding event to favorites:', error);
    }
  };

  const cancelEvent = async () => {
    try {
      const eventDocRef = doc(db, 'events', event.id);
      const eventDoc = await getDoc(eventDocRef);
  
      if (eventDoc.exists() && eventDoc.data().createdByUser === auth.currentUser.uid) {
        await deleteDoc(eventDocRef);
        Alert.alert('Success', 'Event cancelled.');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'You do not have permission to cancel this event.');
      }
    } catch (error) {
      console.error('Error cancelling event:', error);
      Alert.alert('Error', 'Failed to cancel event.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: event.imageUrl }} style={styles.image} resizeMode="contain" />
      <Text style={styles.eventName}>{event.title}</Text>
      <Text style={styles.creatorEmail}>Created by: {creatorEmail}</Text>
      <Text style={styles.date}>Date: {event.date}</Text>
      <Text style={styles.summary}>{event.description}</Text>
      <View style={styles.buttonContainer}>
        {!isFavorited && (
          <TouchableOpacity style={styles.button} onPress={addToFavorites}>
            <Text style={styles.buttonText}>Add to Favorites</Text>
          </TouchableOpacity>
        )}
        {isCreator && (
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={cancelEvent}>
            <Text style={styles.buttonText}>Cancel Event</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 16,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  creatorEmail: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    marginBottom: 8,
  },
  summary: {
    fontSize: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventDetailScreen;