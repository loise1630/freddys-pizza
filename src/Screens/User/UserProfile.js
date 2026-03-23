import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { Text, Avatar, Card, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const UserProfile = () => {
  const user = useSelector(state => state.cartItems.user);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) { setName(user.name); setPhone(user.phone); setAddress(user.address || ''); }
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data, status } = await axios.put(`${BASE_URL}/api/users/${user._id}`, {
        name, phone, address, ...(password.length > 0 && { password }),
      });
      if (status === 200) {
        dispatch({ type: 'UPDATE_USER', payload: data });
        Alert.alert('Success! 🎉', 'Profile updated in database.');
        setIsEditing(false); setPassword('');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update database.');
    } finally { setLoading(false); }
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <Avatar.Icon size={72} icon="account" style={s.avatar} color="#fff" />
        <Text style={s.userName}>{user?.name || 'Guest'}</Text>
        <Text style={s.userEmail}>{user?.email}</Text>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Card style={s.card}>
          <Card.Content>
            {[
              { label: 'Full Name', value: name, setter: setName, icon: 'account', keyboard: 'default' },
              { label: 'Phone Number', value: phone, setter: setPhone, icon: 'phone', keyboard: 'phone-pad' },
              { label: 'Delivery Address', value: address, setter: setAddress, icon: 'map-marker', multiline: true },
            ].map(({ label, value, setter, icon, keyboard, multiline }) => (
              <TextInput key={label} label={label} value={value} onChangeText={setter}
                disabled={!isEditing} mode="outlined" style={s.input}
                keyboardType={keyboard || 'default'} multiline={multiline}
                left={<TextInput.Icon icon={icon} />} />
            ))}

            <TextInput label="New Password" placeholder="Leave blank to keep current"
              value={password} onChangeText={setPassword} disabled={!isEditing}
              mode="outlined" secureTextEntry={!showPassword} style={s.input}
              left={<TextInput.Icon icon="lock" />}
              right={isEditing && <TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
            />
          </Card.Content>
        </Card>

        <View style={s.buttonGroup}>
          {!isEditing ? (
            <Button mode="contained" onPress={() => setIsEditing(true)} style={s.editBtn}>Edit Profile</Button>
          ) : (
            <View style={s.actionRow}>
              <Button mode="outlined" onPress={() => setIsEditing(false)} style={s.halfBtn}>Cancel</Button>
              <Button mode="contained" onPress={handleUpdate} loading={loading} style={[s.halfBtn, { backgroundColor: '#FF6B35' }]}>Save</Button>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    alignItems: 'center', backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 54,
    paddingBottom: 28,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  avatar: { backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 10 },
  userName: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3 },

  body: { padding: 20, paddingBottom: 40 },
  card: { elevation: 3, borderRadius: 16, backgroundColor: '#fff' },
  input: { marginBottom: 12 },
  buttonGroup: { marginTop: 20 },
  editBtn: { backgroundColor: '#FF6B35' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  halfBtn: { width: '48%' },
});

export default UserProfile;