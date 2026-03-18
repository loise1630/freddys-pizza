import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Avatar, Card, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const UserProfile = () => {
  // 1. Kunin ang user object mula sa Redux (Dito nanggagaling ang info mo from Sign Up/Login)
  const user = useSelector(state => state.cartItems.user);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2. I-set ang initial states gamit ang data mula sa Redux
  // Gagamit tayo ng optional chaining (?.) para hindi mag-error kung guest user
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || ""); // Eto yung phone number from sign up
  const [address, setAddress] = useState(user?.address || "");
  const [password, setPassword] = useState(""); 

  // Siguraduhin na mag-a-update ang fields kung sakaling magbago ang Redux state
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setAddress(user.address || "");
    }
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updatedData = {
        name,
        phone,
        address,
        ...(password.length > 0 && { password }) 
      };

      // 3. I-send ang update sa Database
      const response = await axios.put(`${BASE_URL}/api/users/${user._id}`, updatedData);

      if (response.status === 200) {
        // 4. Update Redux para mag-reflect sa UI
        dispatch({ type: 'UPDATE_USER', payload: response.data });
        
        Alert.alert("Success! 🎉", "Profile updated in database.");
        setIsEditing(false);
        setPassword("");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={70} icon="account" style={styles.avatar} color="white" />
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              disabled={!isEditing}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              disabled={!isEditing}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              left={<TextInput.Icon icon="phone" />}
            />

            <TextInput
              label="Delivery Address"
              value={address}
              onChangeText={setAddress}
              disabled={!isEditing}
              mode="outlined"
              multiline
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
            />

            <TextInput
              label="New Password"
              placeholder="Leave blank to keep current"
              value={password}
              onChangeText={setPassword}
              disabled={!isEditing}
              mode="outlined"
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={isEditing && <TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />
          </Card.Content>
        </Card>

        <View style={styles.buttonGroup}>
          {!isEditing ? (
            <Button mode="contained" onPress={() => setIsEditing(true)} style={styles.editBtn}>
              Edit Profile
            </Button>
          ) : (
            <View style={styles.actionRow}>
              <Button mode="outlined" onPress={() => setIsEditing(false)} style={styles.halfBtn}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleUpdate} loading={loading} style={[styles.halfBtn, {backgroundColor: '#e61e1e'}]}>
                Save
              </Button>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { alignItems: 'center', paddingVertical: 25, backgroundColor: '#fff' },
  avatar: { backgroundColor: '#e61e1e', marginBottom: 10 },
  userEmail: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  card: { elevation: 3, borderRadius: 12 },
  input: { marginBottom: 15 },
  buttonGroup: { marginTop: 20 },
  editBtn: { backgroundColor: '#e61e1e' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  halfBtn: { width: '48%' }
});

export default UserProfile;