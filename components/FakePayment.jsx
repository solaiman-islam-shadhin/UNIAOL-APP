import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, TextInput,  ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
// --- Reusable Payment Component ---
export default function FakePayment({ onClose, onPaymentSuccess, amount }) {
    const PAYMENT_METHODS = [
        { id: 'card', title: 'Card' },
        { id: 'bkash', title: 'bKash' },
        { id: 'nagad', title: 'Nagad' },
    ];

    const [selectedMethod, setSelectedMethod] = useState('card');
    const [paymentAmount, setPaymentAmount] = useState(amount.toString());
    const [loading, setLoading] = useState(false);

    // Card state
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvc, setCvc] = useState('');

    // MFS (bKash, etc.) state
    const [mfsStep, setMfsStep] = useState('enterNumber');
    const [mfsAccountNumber, setMfsAccountNumber] = useState('');
    const [mfsPin, setMfsPin] = useState('');

    useEffect(() => {
        setMfsStep('enterNumber');
        setMfsAccountNumber('');
        setMfsPin('');
    }, [selectedMethod]);

    const formatCardNumber = (text) => text.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
    const formatExpiryDate = (text) => {
        const cleaned = text.replace(/\D/g, '');
        return cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned;
    };

    const handlePayment = () => {
        if (['bkash', 'nagad'].includes(selectedMethod)) {
            if (mfsStep === 'enterNumber' && mfsAccountNumber.length < 11) {
                Alert.alert('Invalid Number', 'Please enter a valid account number.');
                return;
            }
            if (mfsStep === 'enterPin' && mfsPin.length < 4) {
                Alert.alert('Invalid PIN', 'Please enter a valid PIN.');
                return;
            }
            if (mfsStep === 'enterNumber') {
                setMfsStep('enterPin');
                return;
            }
        }

        if (selectedMethod === 'card' && (!cardName || cardNumber.length !== 19 || expiryDate.length !== 5 || cvc.length !== 3)) {
            Alert.alert('Validation Error', 'Please fill in all card fields correctly.');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onPaymentSuccess(paymentAmount); // Pass amount back to parent
        }, 2500);
    };

    const renderPaymentMethodContent = () => {
        switch (selectedMethod) {
            case 'card':
                return (
                    <View>
                        <View style={styles.inputGroup}><Text style={styles.label}>Cardholder Name</Text><TextInput style={styles.input} placeholder="John Doe" value={cardName} onChangeText={setCardName} autoCapitalize="words" /></View>
                        <View style={styles.inputGroup}><Text style={styles.label}>Card Number</Text><TextInput style={styles.input} placeholder="0000 0000 0000 0000" value={cardNumber} onChangeText={text => setCardNumber(formatCardNumber(text))} keyboardType="numeric" maxLength={19} /></View>
                        <View style={styles.row}><View style={[styles.inputGroup, styles.flexItem]}><Text style={styles.label}>Expiry Date</Text><TextInput style={styles.input} placeholder="MM/YY" value={expiryDate} onChangeText={text => setExpiryDate(formatExpiryDate(text))} keyboardType="numeric" maxLength={5} /></View><View style={[styles.inputGroup, styles.flexItem]}><Text style={styles.label}>CVC</Text><TextInput style={styles.input} placeholder="123" value={cvc} onChangeText={setCvc} keyboardType="numeric" maxLength={3} secureTextEntry /></View></View>
                    </View>
                );
            case 'bkash': case 'nagad':
                const logoStyle = { bkash: styles.bkashLogo, nagad: styles.nagadLogo };
                return (
                    <View style={styles.apmContainer}>
                        <View style={[styles.apmLogo, logoStyle[selectedMethod]]}><Text style={styles.apmLogoText}>{selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)}</Text></View>
                        {mfsStep === 'enterNumber' && (<View style={styles.mfsInputContainer}><Text style={styles.label}>Enter Your {selectedMethod} Account Number</Text><TextInput style={styles.input} placeholder="e.g., 01700000000" value={mfsAccountNumber} onChangeText={setMfsAccountNumber} keyboardType="phone-pad" maxLength={11} /></View>)}
                        {mfsStep === 'enterPin' && (<View style={styles.mfsInputContainer}><Text style={styles.label}>Enter Your PIN for {mfsAccountNumber}</Text><TextInput style={styles.input} placeholder="PIN" value={mfsPin} onChangeText={setMfsPin} keyboardType="number-pad" maxLength={5} secureTextEntry /></View>)}
                    </View>
                );
            default: return null;
        }
    };

    const getButtonText = () => {
        if (['bkash', 'nagad'].includes(selectedMethod)) {
            if (mfsStep === 'enterNumber') return 'Proceed';
            return `Confirm Payment of ${paymentAmount} tk`;
        }
        return `Pay ${paymentAmount} tk with Card`;
    };

    return (
        <View className="flex-1 bg-[#151527]">
            <SafeAreaView className="flex-1">
                <Pressable style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>✕</Text></Pressable>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <Text style={styles.paymentTitle}>Complete Your Payment</Text>
                        <View style={styles.amountContainer}><Text style={styles.currencySymbol}>tk</Text><TextInput style={styles.amountInput} value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="decimal-pad" placeholder="0.00" /></View>
                        <View style={styles.tabsContainer}>{PAYMENT_METHODS.map(method => (<TouchableOpacity key={method.id} style={[styles.tab, selectedMethod === method.id && styles.activeTab]} onPress={() => setSelectedMethod(method.id)}><Text style={[styles.tabText, selectedMethod === method.id && styles.activeTabText]}>{method.title}</Text></TouchableOpacity>))}</View>
                        <View style={styles.formContent}>{renderPaymentMethodContent()}</View>
                        <TouchableOpacity style={[styles.payButton, loading && styles.buttonDisabled]} onPress={handlePayment} disabled={loading}>{loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.payButtonText}>{getButtonText()}</Text>}</TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    closeButton: { position: 'absolute', top: Platform.OS === 'android' ? 20 : 50, right: 20, backgroundColor: '#e2e8f0', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    closeButtonText: { fontSize: 16, color: '#475569', fontWeight: 'bold' },
    paymentTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 16 },
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
    label: { fontSize: 14, color: 'white', marginBottom: 8, fontWeight: '500' },
    input: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#334155' },
    row: { flexDirection: 'row', marginHorizontal: -8 },
    flexItem: { flex: 1, marginHorizontal: 8 },
    payButton: { padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb' },
    buttonDisabled: { backgroundColor: '#60a5fa' },
    payButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
    apmContainer: { alignItems: 'center', paddingVertical: 20 },
    apmLogo: { width: 96, height: 96, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    bkashLogo: { backgroundColor: '#e2136e' },
    nagadLogo: { backgroundColor: '#f16622' },
    apmLogoText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    mfsInputContainer: { width: '100%', marginTop: 10 },
});
