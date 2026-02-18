import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { DataTable, Text, Searchbar } from 'react-native-paper';

const ProductContainer = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Sample Pizza Data
  const pizzas = [
    { id: 1, name: 'Pepperoni', size: 'Large', price: 499, stock: 15 },
    { id: 2, name: 'Hawaiian', size: 'Medium', price: 350, stock: 8 },
    { id: 3, name: 'Cheese Bomb', size: 'Large', price: 550, stock: 20 },
    { id: 4, name: 'Veggie Delight', size: 'Small', price: 299, stock: 5 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🍕 Pizza Inventory</Text>
      
      <Searchbar
        placeholder="Search Pizza..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      <ScrollView horizontal>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={{ width: 120 }}>Name</DataTable.Title>
            <DataTable.Title numeric>Size</DataTable.Title>
            <DataTable.Title numeric>Price</DataTable.Title>
            <DataTable.Title numeric>Stock</DataTable.Title>
          </DataTable.Header>

          {pizzas.map((pizza) => (
            <DataTable.Row key={pizza.id}>
              <DataTable.Cell style={{ width: 120 }}>{pizza.name}</DataTable.Cell>
              <DataTable.Cell numeric>{pizza.size}</DataTable.Cell>
              <DataTable.Cell numeric>₱{pizza.price}</DataTable.Cell>
              <DataTable.Cell numeric>{pizza.stock}</DataTable.Cell>
            </DataTable.Row>
          ))}

          <DataTable.Pagination
            page={0}
            numberOfPages={3}
            onPageChange={(page) => console.log(page)}
            label="1-2 of 4"
          />
        </DataTable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e61e1e',
    marginBottom: 20,
    textAlign: 'center',
  },
  search: {
    marginBottom: 20,
    elevation: 2,
    backgroundColor: '#f6f6f6'
  },
  table: {
    minWidth: 400, // Para hindi siksikan ang columns
  },
  tableHeader: {
    backgroundColor: '#f1f1f1',
  },
});

export default ProductContainer;