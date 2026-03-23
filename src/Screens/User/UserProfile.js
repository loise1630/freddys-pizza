import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, StatusBar, Platform, TouchableOpacity, Image } from 'react-native';
import { Text, Card, TextInput, Button, IconButton } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const FIELDS = [
  { label: 'Full Name',        key: 'name',    icon: 'account',    keyboard: 'default' },
  { label: 'Phone Number',     key: 'phone',   icon: 'phone',      keyboard: 'phone-pad' },
  { label: 'Delivery Address', key: 'address', icon: 'map-marker', multiline: true },
];

const UserProfile = () => {
  const user     = useSelector(state => state.cartItems.user);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [password, setPassword]   = useState('');
  const [photo, setPhoto]         = useState(user?.image || null);
  const [form, setForm]           = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, phone: user.phone || '', address: user.address || '' });
      setPhoto(user.image || null);
    }
  }, [user]);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed', 'Allow access to your photos.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.4,
      base64: true, // get base64 so it can be saved to DB
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      // base64 data URI works both as <Image source> and as DB value
      setPhoto(`data:image/jpeg;base64,${asset.base64}`);
    }
  };

  const handleUpdate = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name cannot be empty.');
    setLoading(true);
    try {
      const payload = {
        ...form,
        image: photo || '', // base64 data URI or existing saved URL
        ...(password.trim() && { password: password.trim() }),
      };
      const { data } = await axios.put(`${BASE_URL}/api/users/${user._id}`, payload);
      dispatch({ type: 'UPDATE_USER', payload: data });
      setForm({ name: data.name, phone: data.phone ?? '', address: data.address ?? '' });
      setPhoto(data.image || null); // reset to saved string from DB
      const stored = await AsyncStorage.getItem('user');
      if (stored) await AsyncStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...data }));
      Alert.alert('Success! 🎉', 'Profile updated.');
      setIsEditing(false); setPassword('');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update.');
    } finally { setLoading(false); }
  };

  return (
    <View style={s.container}>
      <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />

      <View style={s.header}>
        {/* Profile Photo */}
        <TouchableOpacity onPress={isEditing ? pickPhoto : null} style={s.avatarWrap} activeOpacity={isEditing ? 0.8 : 1}>
          {photo ? (
            <Image source={{ uri: photo?.uri || photo }} style={s.avatarImg} />
          ) : (
            <View style={s.avatarPlaceholder}>
              <Text style={s.avatarInitial}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
            </View>
          )}
          {isEditing && (
            <View style={s.cameraBtn}>
              <IconButton icon="camera" size={14} iconColor="#FF6B35" style={{ margin: 0 }} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={s.userName}>{user?.name || 'Guest'}</Text>
        <Text style={s.userEmail}>{user?.email}</Text>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Card style={s.card}>
          <Card.Content>
            {FIELDS.map(({ label, key, icon, keyboard, multiline }) => (
              <TextInput key={key} label={label} value={form[key]} onChangeText={set(key)}
                disabled={!isEditing} mode="outlined" style={s.input}
                keyboardType={keyboard} multiline={multiline}
                left={<TextInput.Icon icon={icon} />} />
            ))}
            <TextInput label="New Password" placeholder="Leave blank to keep current"
              value={password} onChangeText={setPassword} disabled={!isEditing}
              mode="outlined" secureTextEntry={!showPass} style={s.input}
              left={<TextInput.Icon icon="lock" />}
              right={isEditing && <TextInput.Icon icon={showPass ? 'eye-off' : 'eye'} onPress={() => setShowPass(!showPass)} />}
            />
          </Card.Content>
        </Card>

        <View style={s.buttonGroup}>
          {!isEditing ? (
            <Button mode="contained" onPress={() => setIsEditing(true)} style={s.editBtn}>Edit Profile</Button>
          ) : (
            <View style={s.actionRow}>
              <Button mode="outlined" onPress={() => { setIsEditing(false); setPhoto(user?.image || null); }} style={s.halfBtn}>Cancel</Button>
              <Button mode="contained" onPress={handleUpdate} loading={loading} style={[s.halfBtn, { backgroundColor: '#FF6B35' }]}>Save</Button>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const AVATAR_SIZE = 90;

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    alignItems: 'center', backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 54,
    paddingBottom: 28, borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },

  avatarWrap: { marginBottom: 12, position: 'relative' },
  avatarImg: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 36, fontWeight: '800' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 14, width: 28, height: 28,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3,
  },


  userName:    { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  userEmail:   { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3 },

  body:        { padding: 20, paddingBottom: 40 },
  card:        { elevation: 3, borderRadius: 16, backgroundColor: '#fff' },
  input:       { marginBottom: 12 },
  buttonGroup: { marginTop: 20 },
  editBtn:     { backgroundColor: '#FF6B35' },
  actionRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  halfBtn:     { width: '48%' },
});

export default UserProfile;