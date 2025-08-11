import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
export default function CartPage() {

  const { items, totalPrice } = useCart();

  return (
  <View>
     <LinearGradient className='bg-[#151527] px-3 h-full' colors={['#151527','#0e1636', '#ff8353','#000000','transparent']} start={{ x: 0.8, y: 0.2 }} end={{ x: 1.9, y: 0.6 }} >
     <View style={styles.container}className="text-white">
      <Text style={styles.title} className="text-white">Your Cart 🛒</Text>
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.cartItem} className="gap-3 ">
            <Text style={styles.itemName} className="text-white">{item.course_name}</Text>
            <Text style={styles.itemPrice} className="text-white">{item.price.toFixed(2)}TK</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText} className="text-white">Your cart is empty.</Text>
        }
      />
      {items.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText} className="text-white">Total:</Text>
          <Text style={styles.totalPrice}>{totalPrice.toFixed(2)}TK</Text>
        </View>
      )}
    </View>
    </LinearGradient>
    </View>
  
  );
}

const styles = StyleSheet.create({
  container: { flexDirection:'column', padding: 5,marginTop:5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  itemName: { fontSize: 14 },
  itemPrice: { fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'white' },
  totalContainer: {
    flexDirection: 'row',
    
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: 'white',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white', 
  },
});