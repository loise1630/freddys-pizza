import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Text, Searchbar, Card, Modal, Portal, PaperProvider, IconButton } from 'react-native-paper';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const { width } = Dimensions.get('window');
const itemWidth = (width / 2) - 20; // Para magkasya ang dalawang column na may padding

const ProductContainer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchPizzas = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/products`);
      setPizzas(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();
  }, []);

  const showDetails = (item) => {
    setSelectedProduct(item);
    setVisible(true);
  };

  const hideModal = () => setVisible(false);

  const filteredPizzas = pizzas.filter((pizza) =>
    pizza.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.gridItem}>
      <Card style={styles.card}>
        {/* CLICKABLE IMAGE */}
        <TouchableOpacity onPress={() => showDetails(item)}>
          <Image 
            source={{ uri: item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/150' }} 
            style={styles.pizzaImage} 
          />
          {/* THE PLUS BUTTON (+) */}
          <View style={styles.plusButtonContainer}>
             <IconButton
                icon="plus"
                size={20}
                iconColor="black"
                style={styles.plusButton}
                onPress={() => Alert.alert("Add to Cart", `${item.name} added!`)}
              />
          </View>
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text style={styles.pizzaName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.pizzaPriceText}>from ₱ {item.price.toFixed(2)}</Text>
        </View>
      </Card>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#e61e1e" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.header}>Most ordered right now.</Text>
        
        <Searchbar
          placeholder="Search Pizza..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.search}
        />

        <FlatList
          data={filteredPizzas}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          numColumns={2} // Eto ang magic para sa 2-column grid
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No Pizza Found.</Text>}
        />

        {/* MODAL PARA SA DESCRIPTION PAG CLINICK ANG IMAGE */}
        <Portal>
          <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modalContent}>
            {selectedProduct && (
              <View>
                <Image source={{ uri: selectedProduct.images[0] }} style={styles.modalImage} />
                <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                <Text style={styles.modalDesc}>{selectedProduct.description}</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={hideModal}>
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { fontSize: 16, color: '#666', paddingHorizontal: 15, marginBottom: 10 },
  search: { marginHorizontal: 15, marginBottom: 20, backgroundColor: '#f5f5f5', elevation: 0, borderRadius: 25 },
  listContainer: { paddingHorizontal: 10 },
  
  // GRID CARD STYLES
  gridItem: { width: '50%', padding: 5 },
  card: { backgroundColor: '#fff', elevation: 0, borderRadius: 15, overflow: 'hidden' },
  pizzaImage: { width: '100%', height: 160, borderRadius: 15 },
  
  // PLUS BUTTON POSITIONING
  plusButtonContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },
  plusButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 0,
    elevation: 3,
  },

  cardContent: { paddingVertical: 10, paddingHorizontal: 5 },
  pizzaName: { fontSize: 14, fontWeight: '700', color: '#333', lineHeight: 18, marginBottom: 4 },
  pizzaPriceText: { fontSize: 13, color: '#444' },

  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },

  // MODAL STYLES
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 20 },
  modalImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalDesc: { fontSize: 16, color: '#666' },
  closeBtn: { marginTop: 20, backgroundColor: '#e61e1e', padding: 10, borderRadius: 10, alignItems: 'center' }
});

export default ProductContainer;