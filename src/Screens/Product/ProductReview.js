import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const ProductReview = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Kunin ang params, kasama ang existingReview kung galing sa "Edit" button
  const { productId, userId, userName, productName, existingReview } = route.params || {};

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // LOGIC: I-load ang dating data kung "Edit" mode
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  const submitReview = async () => {
    if (!productId || !userId) {
      Alert.alert("Error", "Missing information to submit review.");
      return;
    }

    if (rating === 0 || !comment.trim()) {
      Alert.alert("Wait", "Please provide a rating and a comment.");
      return;
    }

    setLoading(true);
    try {
      if (existingReview) {
        // --- EDIT MODE (PUT) ---
        const response = await axios.put(`${BASE_URL}/api/reviews/update/${existingReview._id}`, {
          rating,
          comment
        });

        if (response.status === 200) {
          Alert.alert("Success", "Your review has been updated! 🍕");
          navigation.goBack();
        }
      } else {
        // --- ADD MODE (POST) ---
        const response = await axios.post(`${BASE_URL}/api/reviews/add`, {
          productId,
          userId,
          userName: userName || "Anonymous",
          rating,
          comment
        });

        if (response.status === 201) {
          Alert.alert("Success", "Thank you for your review!");
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error("Submit Review Error:", error);
      Alert.alert("Error", "Could not save your review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {existingReview ? `Edit Review for ${productName}` : `Rate ${productName || 'Product'}`}
      </Text>
      <Text style={styles.subtitle}>
        {existingReview ? "Update your experience with this order" : "How was your experience?"}
      </Text>
      
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, { color: rating >= star ? '#FFD700' : '#CCC' }]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Write your feedback here..."
        multiline
        numberOfLines={4}
        value={comment}
        onChangeText={setComment}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B35" />
      ) : (
        <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
          <Text style={styles.submitBtnText}>
            {existingReview ? "Update Review" : "Submit Review"}
          </Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={{marginTop: 20}} 
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={{color: '#888', textAlign: 'center'}}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 30 },
  starContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  star: { fontSize: 50, marginHorizontal: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 15,
    height: 150,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
    marginBottom: 25,
    color: '#000'
  },
  submitBtn: {
    backgroundColor: '#FF6B35',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2
  },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ProductReview;