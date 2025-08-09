import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';

// --- Mock Data for the Course ---
const courseData = {
    id: 'rn101',
    title: 'React Native for Beginners',
    price: '49.99',
    description: 'A comprehensive guide to building your first mobile app.',
    content: 'Welcome! \n\nLesson 1: Introduction to React Native\nLesson 2: Setting up your environment\nLesson 3: Components and Props\n...'
};


// --- Reusable Payment Component (defined inside for a single file) ---
const FakePaymentComponent = ({ onClose, onPaymentSuccess, coursePrice }) => {
    const PAYMENT_METHODS = [
        { id: 'card', title: 'Card' },
        { id: 'bkash', title: 'bKash' },
        { id: 'nagad', title: 'Nagad' },
        { id: 'pathao', title: 'Pathao Pay' },
    ];

    const [selectedMethod, setSelectedMethod] = useState('card');
    const [paymentAmount, setPaymentAmount] = useState(coursePrice); // Set initial amount from props
    const [loading, setLoading] = useState(false);

    // Card state
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');

    // MFS (bKash, etc.) state
    const [mfsStep, setMfsStep] = useState('enterNumber'); // 'enterNumber' or 'enterPin'
    const [mfsAccountNumber, setMfsAccountNumber] = useState('');
    const [mfsPin, setMfsPin] = useState('');

    // Reset MFS flow when payment method changes
    useEffect(() => {
        setMfsStep('enterNumber');
        setMfsAccountNumber('');
        setMfsPin('');
    }, [selectedMethod]);

    const formatCardNumber = (text) => {
        const cleaned = text.replace(/\D/g, '');
        return cleaned.match(/.{1,4}/g)?.join(' ') || '';
    };

    const formatExpiryDate = (text) => {
        const cleaned = text.replace(/\D/g, '');
        return cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned;
    };

    const resetForms = () => {
        setCardName('');
        setCardNumber('');
        setExpiryDate('');
        setCvc('');
        setMfsAccountNumber('');
        setMfsPin('');
        setMfsStep('enterNumber');
    };

    const handlePayment = () => {
        // --- MFS Payment Flow ---
        if (['bkash', 'nagad', 'pathao'].includes(selectedMethod)) {
            if (mfsStep === 'enterNumber') {
                if (mfsAccountNumber.length < 11) { // Basic validation
                    Alert.alert('Invalid Number', 'Please enter a valid account number.');
                    return;
                }
                setMfsStep('enterPin'); // Move to next step
                return;
            }

            if (mfsStep === 'enterPin') {
                if (mfsPin.length < 4) { // Basic validation
                    Alert.alert('Invalid PIN', 'Please enter a valid PIN.');
                    return;
                }
                // Continue to payment processing
            }
        }

        // --- Card Payment Flow ---
        if (selectedMethod === 'card') {
            if (!cardName || cardNumber.length !== 19 || expiryDate.length !== 5 || cvc.length !== 3) {
                Alert.alert('Validation Error', 'Please fill in all card fields correctly.');
                return;
            }
        }
        
        // --- Common Payment Processing ---
        if (!paymentAmount || isNaN(parseFloat(paymentAmount)) || parseFloat(paymentAmount) <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid payment amount.');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const isSuccess = Math.random() > 0.2;
            if (isSuccess) {
                onPaymentSuccess(paymentAmount, selectedMethod);
                resetForms();
            } else {
                Alert.alert('Payment Failed', `We could not process your payment. Please try again.`);
            }
        }, 2500);
    };

    const renderPaymentMethodContent = () => {
      switch (selectedMethod) {
        case 'card':
          return (
            <View>
              <View style={styles.inputGroup}><Text style={styles.label}>Cardholder Name</Text><TextInput style={styles.input} placeholder="John Doe" value={cardName} onChangeText={setCardName} autoCapitalize="words"/></View>
              <View style={styles.inputGroup}><Text style={styles.label}>Card Number</Text><TextInput style={styles.input} placeholder="0000 0000 0000 0000" value={cardNumber} onChangeText={text => setCardNumber(formatCardNumber(text))} keyboardType="numeric" maxLength={19}/></View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flexItem]}><Text style={styles.label}>Expiry Date</Text><TextInput style={styles.input} placeholder="MM/YY" value={expiryDate} onChangeText={text => setExpiryDate(formatExpiryDate(text))} keyboardType="numeric" maxLength={5}/></View>
                <View style={[styles.inputGroup, styles.flexItem]}><Text style={styles.label}>CVC</Text><TextInput style={styles.input} placeholder="123" value={cvc} onChangeText={setCvc} keyboardType="numeric" maxLength={3} secureTextEntry/></View>
              </View>
            </View>
          );
        case 'bkash': case 'nagad': case 'pathao':
          const logoStyle = { bkash: styles.bkashLogo, nagad: styles.nagadLogo, pathao: styles.pathaoLogo };
          return (
            <View style={styles.apmContainer}>
              <View style={[styles.apmLogo, logoStyle[selectedMethod]]}><Text style={styles.apmLogoText}>{selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)}</Text></View>
              
              {mfsStep === 'enterNumber' && (
                <View style={styles.mfsInputContainer}>
                  <Text style={styles.label}>Enter Your {selectedMethod} Account Number</Text>
                  <TextInput style={styles.input} placeholder="e.g., 01700000000" value={mfsAccountNumber} onChangeText={setMfsAccountNumber} keyboardType="phone-pad" maxLength={11}/>
                </View>
              )}

              {mfsStep === 'enterPin' && (
                <View style={styles.mfsInputContainer}>
                  <Text style={styles.label}>Enter Your PIN for {mfsAccountNumber}</Text>
                  <TextInput style={styles.input} placeholder="PIN" value={mfsPin} onChangeText={setMfsPin} keyboardType="number-pad" maxLength={5} secureTextEntry/>
                </View>
              )}
            </View>
          );
        default: return null;
      }
    };

    const getButtonText = () => {
        if (['bkash', 'nagad', 'pathao'].includes(selectedMethod)) {
            if (mfsStep === 'enterNumber') return 'Proceed';
            if (mfsStep === 'enterPin') return `Confirm Payment of $${paymentAmount || '0.00'}`;
        }
        return `Pay $${paymentAmount || '0.00'} with ${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)}`;
    };

    return (
        <View style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <SafeAreaView style={styles.safeArea}>
                <Pressable style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>✕</Text></Pressable>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Text style={styles.title}>Complete Your Payment</Text>
                        <View style={styles.amountContainer}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput style={styles.amountInput} value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="decimal-pad" placeholder="0.00"/>
                        </View>
                        <View style={styles.tabsContainer}>
                            {PAYMENT_METHODS.map(method => (
                                <TouchableOpacity key={method.id} style={[styles.tab, selectedMethod === method.id && styles.activeTab]} onPress={() => setSelectedMethod(method.id)}>
                                    <Text style={[styles.tabText, selectedMethod === method.id && styles.activeTabText]}>{method.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.formContent}>{renderPaymentMethodContent()}</View>
                        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handlePayment} disabled={loading}>
                            {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.buttonText}>{getButtonText()}</Text>}
                        </TouchableOpacity>
                        <Text style={styles.disclaimer}>This is a demo payment form. No real transaction will be made.</Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

// --- Main Screen Component ---
const Profile = () => {
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  const handlePaymentSuccess = (amount, method) => {
    // Check if the paid amount matches the course price
    if (parseFloat(amount) === parseFloat(courseData.price)) {
        setPaymentModalVisible(false); // Close the modal
        setIsPurchased(true); // Set the course as purchased
        Alert.alert(
            'Purchase Successful!',
            `You have successfully purchased "${courseData.title}".`,
            [{ text: 'Great!' }]
        );
    } else {
        // If price doesn't match
        Alert.alert(
            'Payment Error',
            `The amount paid ($${amount}) does not match the course price ($${courseData.price}). Please try again.`,
            [{ text: 'OK' }]
        );
    }
  };

  const handleWatchNow = () => {
    Alert.alert(
        `Course Content: ${courseData.title}`,
        courseData.content,
        [{ text: 'Close' }]
    );
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.productTitle}>{courseData.title}</Text>
      <Text style={styles.productDescription}>{courseData.description}</Text>
      
      {!isPurchased && (
        <Text style={styles.productPrice}>${courseData.price}</Text>
      )}
      
      {isPurchased ? (
         <TouchableOpacity style={styles.watchButton} onPress={handleWatchNow}>
            <Text style={styles.buyButtonText}>Watch Now</Text>
         </TouchableOpacity>
      ) : (
        <TouchableOpacity 
            style={styles.buyButton} 
            onPress={() => setPaymentModalVisible(true)}
        >
            <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={isPaymentModalVisible}
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <FakePaymentComponent 
          onClose={() => setPaymentModalVisible(false)}
          onPaymentSuccess={handlePaymentSuccess}
          coursePrice={courseData.price} // Pass the price to the payment modal
        />
      </Modal>
    </View>
  );
};

// --- Styles for BOTH components ---
const styles = StyleSheet.create({
  // Styles for Product Screen
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  productTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  productDescription: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 16 },
  productPrice: { fontSize: 22, color: '#333', fontWeight: 'bold', marginBottom: 30 },
  buyButton: { backgroundColor: '#2563eb', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12 },
  watchButton: { backgroundColor: '#16a34a', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12 },
  buyButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  // Styles for Payment Component
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  closeButton: { position: 'absolute', top: Platform.OS === 'android' ? 20 : 50, right: 20, backgroundColor: '#e2e8f0', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  closeButtonText: { fontSize: 16, color: '#475569', fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', marginBottom: 16 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12 },
  currencySymbol: { fontSize: 28, fontWeight: 'bold', color: '#94a3b8', marginLeft: 16 },
  amountInput: { flex: 1, fontSize: 32, fontWeight: 'bold', color: '#1e293b', padding: 12, textAlign: 'center' },
  tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  activeTab: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  activeTabText: { color: '#2563eb' },
  formContent: { marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#334155', marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#334155' },
  row: { flexDirection: 'row', marginHorizontal: -8 },
  flexItem: { flex: 1, marginHorizontal: 8 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb' },
  buttonDisabled: { backgroundColor: '#60a5fa' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  disclaimer: { marginTop: 24, fontSize: 12, color: '#64748b', textAlign: 'center' },
  apmContainer: { alignItems: 'center', paddingVertical: 20 },
  apmLogo: { width: 96, height: 96, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  bkashLogo: { backgroundColor: '#e2136e' },
  nagadLogo: { backgroundColor: '#f16622' },
  pathaoLogo: { backgroundColor: '#d9232d' },
  apmLogoText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  mfsInputContainer: { width: '100%', marginTop: 10 },
});

export default Profile;
