import { View, Text, FlatList, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useCart } from '../context/CartContext';
import Fontisto from '@expo/vector-icons/Fontisto';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
export default function CartPage() {
const router = useRouter();
  const { items, totalPrice, removeFromCart } = useCart();

  return (
    <View>
      <LinearGradient className='bg-[#151527] px-3 h-full' colors={['#151527', '#0e1636', '#ff8353', '#000000', 'transparent']} start={{ x: 0.8, y: 0.2 }} end={{ x: 1.9, y: 0.6 }} >
        <View style={styles.container} className="text-white">
          <View className="flex-row  items-center gap-3 mt-5 mb-6 ">
            <TouchableOpacity className='relative top-1 ' onPress={() => router.back()} >
            <MaterialCommunityIcons name="backburger" size={32} color="#ff8353" />
          </TouchableOpacity>
            <Text style={styles.title} className="text-[#ff8353]">Your Cart 🛒</Text>
          </View>
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (

              <View className='border-2 border-[#ff8353] rounded-xl mb-4 '>

                <View style={styles.cartItem} className="gap-3    ">
                  <Text style={styles.itemName} className="text-white">{item.course_name}</Text>
                  <Text style={styles.itemPrice} className="text-white">{item.price}TK</Text>
                </View>
                <Pressable onPress={() => removeFromCart(item.id)} className='felx justify-end items-end'>
                  <Fontisto className="  px-2 pt-1 pb-2" name="shopping-basket-remove" size={22} color="#ff8353" />
                </Pressable>
              </View>

            )}
            ListEmptyComponent={
              <Text style={styles.emptyText} className="text-white">Your cart is empty.</Text>
            }
          />
          {items.length > 0 && (
            <View style={styles.totalContainer} className='flex flex-row justify-between items-center'>
              <View style={styles.totalContainer_2}>
                <Text style={styles.totalText} className="text-white">Total:</Text>
                <Text style={styles.totalPrice}>{totalPrice}TK</Text>
              </View>
              <TouchableOpacity className=" w-36 border-2 border-[#ff8353] rounded-xl py-2 px-2">
                <Text style={styles.totalText} className='text-white text-center'>Buy Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'column', padding: 5, marginTop: 5, fontFamily: 'JosefinSans-Regular' },
  title: { fontSize: 28, fontFamily: 'JosefinSans-Bold' },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    fontFamily: 'JosefinSans-Regular'
  },
  itemName: { fontSize: 14, fontFamily: 'JosefinSans-Regular' },
  itemPrice: { fontSize: 14, fontFamily: 'JosefinSans-Regular' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'white' },
  totalContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: 'white',
    gap: '5'
  },
  totalContainer_2: {
    flexDirection: 'row',
    gap: '5'
  },
  totalText: {
    fontSize: 22,
    fontFamily: 'JosefinSans-Bold'
  },
  totalPrice: {
    fontSize: 22,
    color: 'white',
    fontFamily: 'JosefinSans-Bold'
  },
});