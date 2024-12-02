import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const FavoritesScreen = ({ navigation }) => {
  const [favoriteEvents, setFavoriteEvents] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavoriteEvents();
    }, [])
  );

  const fetchFavoriteEvents = async () => {
    try {
      const userId = auth.currentUser.uid;
      const eventsCollection = collection(db, 'events');
      const favoritesCollection = collection(db, 'favorites');
      
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const favoritesQuery = query(favoritesCollection, where('userId', '==', userId));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoriteEventIds = favoritesSnapshot.docs.map(doc => doc.data().eventId);

      const favoriteEventsList = eventsList.filter(event => favoriteEventIds.includes(event.id));
      setFavoriteEvents(favoriteEventsList);
    } catch (error) {
      console.error('Error fetching favorite events:', error);
    }
  };

  const unfavoriteEvent = async (eventId) => {
    try {
      const userId = auth.currentUser.uid;
      const favoritesCollection = collection(db, 'favorites');
      const favoritesQuery = query(favoritesCollection, where('userId', '==', userId), where('eventId', '==', eventId));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoriteDocId = favoritesSnapshot.docs[0].id;

      await deleteDoc(doc(db, 'favorites', favoriteDocId));
      fetchFavoriteEvents();
    } catch (error) {
      console.error('Error unfavoriting event:', error);
    }
  };

  const handleUnfavoriteEvent = (eventId) => {
    Alert.alert(
      'Unfavorite Event',
      'Are you sure you want to unfavorite this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => unfavoriteEvent(eventId) },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDate}>{item.date}</Text>
      <Text style={styles.eventDescription}>{item.description}</Text>
      <TouchableOpacity onPress={() => handleUnfavoriteEvent(item.id)} style={styles.bookmarkButton}>
        <Ionicons name="bookmark" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteEvents}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  bookmarkButton: {
    alignSelf: 'flex-end',
  },
});

export default FavoritesScreen;