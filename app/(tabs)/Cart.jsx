import { View, Text, FlatList, StyleSheet, Pressable, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Fontisto from '@expo/vector-icons/Fontisto';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import {  onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../config/FireBAseConfig';
import FakePayment from '../../components/FakePayment';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
export default function Cart() {
    const router = useRouter();
    const { items, totalPrice, removeFromCart, purchaseCourse, setItems } = useCart();
    const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
   
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    setCurrentUser(user);
                    
                    const cartCollectionRef = collection(db, "users", user.uid, "cart");
                    const querySnapshot = await getDocs(cartCollectionRef);
                    const firestoreCartItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setItems(firestoreCartItems); 
                } else {
                    setCurrentUser(null);
                    setItems([]); 
                }
            } catch (error) {
                console.error("Failed to fetch cart:", error);
                
            } finally {
                
                setLoading(false);
            }
        });

        return () => unsubscribe(); 
    }, []);


    const handlePaymentSuccess = async (paidAmount) => {
        if (!currentUser) return;

        if (parseFloat(paidAmount) !== totalPrice) {
            Alert.alert('Payment Error', `The amount paid (${paidAmount} tk) does not match the total price (${totalPrice} tk).`);
            return;
        }

        const batch = writeBatch(db);

        items.forEach(item => {
            const purchaseRef = doc(db, "users", currentUser.uid, "myCourses", item.id);
            batch.set(purchaseRef, {
                courseId: item.id,
                purchaseDate: new Date(),
                ...item
            });

            const cartItemRef = doc(db, "users", currentUser.uid, "cart", item.id);
            batch.delete(cartItemRef);
        });

        try {
            await batch.commit();
            
            items.forEach(item => {
                purchaseCourse(item);
            });
            setItems([]);

            setPaymentModalVisible(false);
            Alert.alert('Purchase Successful!', 'All courses have been added to "My Classes".');
          
            router.push('Class');
        } catch (error) {
            console.error("Error during batch purchase:", error);
            Alert.alert("Error", "There was a problem completing your purchase.");
        }
    };

    const handleRemoveFromCart = async (itemId) => {
        if (!currentUser) return;

        try {
            const cartItemRef = doc(db, "users", currentUser.uid, "cart", itemId);
            await deleteDoc(cartItemRef);
            removeFromCart(itemId);
            Toast.show({
                type: 'error',
                text1: 'Item removed from cart.',
                visibilityTime: 1000
            });
        } catch (error) {
            console.error("Error removing item from cart:", error);
            Alert.alert("Error", "Could not remove item from cart.");
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-[#151527]">
                <ActivityIndicator size="large" color="#ff8353" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1">
             <StatusBar barStyle={"light-content"} backgroundColor='#151527' />
            <LinearGradient className='flex-1 px-3' colors={['#151527', '#0e1636', '#ff8353']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
                <View style={styles.container}>
                    <View className="flex-row items-center gap-3 mt-5 mb-6">
                        <TouchableOpacity className='' onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={30} color="#ff8353" />
                        </TouchableOpacity>
                        <Text style={styles.title} className="text-[#ff8353]">Your Cart 🛒</Text>
                    </View>

                    {!currentUser ? (
                        <View className="flex justify-center items-center">
                      
                            <Text style={styles.emptyText} className="text-white text-center">Please log in to view and manage your cart.</Text>
                            <TouchableOpacity onPress={() => router.push('/Login')} className="w-full bg-[#ff8353] py-4 mt-8 rounded-full">
                                <Text className="text-center font-bold text-white text-lg" style={styles.buttonText}>Login / Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={items}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View className='border-2 border-[#ff8353] rounded-xl mb-4 p-2 flex-row justify-between items-center'>
                                        <View>
                                            <Text style={styles.itemName} className="text-white">{item.course_name}</Text>
                                            <Text style={styles.itemPrice} className="text-white">{item.price} TK</Text>
                                        </View>
                                        <Pressable onPress={() => handleRemoveFromCart(item.id)} className='p-2'>
                                            <Fontisto name="shopping-basket-remove" size={22} color="#ff8353" />
                                        </Pressable>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <View className="items-center mt-20">

                                        <Text style={styles.emptyText} className="text-white -mt-5">Your cart is empty.</Text>
                                    </View>
                                }
                            />
                            {items.length > 0 && (
                                <View style={styles.totalContainer} className='flex-row justify-between items-center'>
                                    <View className='flex-row items-center gap-2'>
                                        <Text style={styles.totalText} className="text-white">Total:</Text>
                                        <Text style={styles.totalPrice}>{totalPrice} TK</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setPaymentModalVisible(true)} className="w-36 border-2 border-[#ff8353] rounded-xl py-2 px-2">
                                        <Text style={styles.totalText} className='text-white text-center'>Buy Now</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </View>
                        <TouchableOpacity
          onPress={() => router.push('/Chatbot')}
          className="absolute top-4 right-4 "
        >
          <Ionicons className=' bg-[#ff8353] p-2 rounded-full shadow-lg' name="chatbubble-ellipses-outline" size={30} color="#151527" />
        </TouchableOpacity>
            </LinearGradient>

            <Modal visible={isPaymentModalVisible} animationType="slide" onRequestClose={() => setPaymentModalVisible(false)}>
                <FakePayment onClose={() => setPaymentModalVisible(false)} onPaymentSuccess={handlePaymentSuccess} amount={totalPrice} />
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {  padding: 0, marginTop: 0, fontFamily: 'NataSans-Regular' },
    title: { fontSize: 28, fontFamily: 'Cinzel-Bold' },
    itemName: { fontSize: 16, fontFamily: 'NataSans-SemiBold' },
    itemPrice: { fontSize: 16, fontFamily: 'NataSans-Regular', opacity: 0.8 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: 'white', fontFamily: 'NataSans-SemiBold' },
    totalContainer: { marginTop: 20, paddingTop: 15, borderTopWidth: 2, borderTopColor: 'white' },
    totalText: { fontSize: 22, fontFamily: 'NataSans-Bold' },
    totalPrice: { fontSize: 22, color: 'white', fontFamily: 'NataSans-Bold' },
    buttonText: { fontFamily: 'Cinzel-SemiBold' },
});
