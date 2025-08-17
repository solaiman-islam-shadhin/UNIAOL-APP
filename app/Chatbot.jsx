import { View, Text, SafeAreaView, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, BackHandler } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

// --- Firebase Imports ---
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/FireBAseConfig'; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';

// --- Color Palettes ---
const colorPalettes = [
    // --- Professional & Muted Palettes ---
    { primary: '#5dade2', gradient: ['#2c3e50', '#1a2531'], user: '#5dade2', bot: '#4e5d6c', input: '#4e5d6c', text: '#FFFFFF' },
    { primary: '#48c9b0', gradient: ['#23313f', '#34495e'], user: '#48c9b0', bot: '#5c6a79', input: '#5c6a79', text: '#FFFFFF' },
    { primary: '#af7ac5', gradient: ['#2c3e50', '#1a2531'], user: '#af7ac5', bot: '#4e5d6c', input: '#4e5d6c', text: '#FFFFFF' },
    { primary: '#e59866', gradient: ['#4a235a', '#2c3e50'], user: '#e59866', bot: '#5c6a79', input: '#5c6a79', text: '#FFFFFF' },
    { primary: '#85c1e9', gradient: ['#154360', '#1a2531'], user: '#85c1e9', bot: '#2471a3', input: '#2471a3', text: '#FFFFFF' },
    { primary: '#76d7c4', gradient: ['#148f77', '#0e6655'], user: '#76d7c4', bot: '#117864', input: '#0b5345', text: '#FFFFFF' },
    { primary: '#a569bd', gradient: ['#2c3e50', '#4a235a'], user: '#a569bd', bot: '#5c6a79', input: '#5c6a79', text: '#FFFFFF' },
    { primary: '#f7f9f9', gradient: ['#839192', '#5d6d7e'], user: '#34495e', bot: '#d0d3d4', input: '#d0d3d4', text: '#FFFFFF' },

    // --- Vibrant & Energetic Palettes ---
    { primary: '#f39c12', gradient: ['#d35400', '#873600'], user: '#f39c12', bot: '#e67e22', input: '#e67e22', text: '#FFFFFF' },
    { primary: '#8e44ad', gradient: ['#2c003e', '#1a0022'], user: '#8e44ad', bot: '#4a235a', input: '#4a235a', text: '#FFFFFF' },
    { primary: '#2980b9', gradient: ['#1a2531', '#0e1636'], user: '#2980b9', bot: '#34495e', input: '#34495e', text: '#FFFFFF' },
    { primary: '#d35400', gradient: ['#3e2723', '#212121'], user: '#d35400', bot: '#6d4c41', input: '#6d4c41', text: '#FFFFFF' },
    { primary: '#c0392b', gradient: ['#2c3e50', '#1b2631'], user: '#c0392b', bot: '#7b241c', input: '#7b241c', text: '#FFFFFF' },
    { primary: '#16a085', gradient: ['#0e6251', '#0b5345'], user: '#16a085', bot: '#117864', input: '#117864', text: '#FFFFFF' },
    { primary: '#27ae60', gradient: ['#145a32', '#186a3b'], user: '#27ae60', bot: '#1e8449', input: '#1e8449', text: '#FFFFFF' },
    { primary: '#ff4b5c', gradient: ['#4b0008', '#2a0004'], user: '#ff4b5c', bot: '#a01221', input: '#a01221', text: '#FFFFFF' },

    // --- Light & Airy Palettes ---
    { primary: '#3498db', gradient: ['#ecf0f1', '#ffffff'], user: '#3498db', bot: '#bdc3c7', input: '#ecf0f1', text: '#1A1A1A' },
    { primary: '#9b59b6', gradient: ['#f5f5f5', '#e8eaf6'], user: '#9b59b6', bot: '#d1c4e9', input: '#d1c4e9', text: '#1A1A1A' },
    { primary: '#1abc9c', gradient: ['#e0f2f1', '#ffffff'], user: '#1abc9c', bot: '#b2dfdb', input: '#b2dfdb', text: '#1A1A1A' },
    { primary: '#e74c3c', gradient: ['#fdebd0', '#fef9e7'], user: '#e74c3c', bot: '#fad7a0', input: '#fad7a0', text: '#1A1A1A' },
    { primary: '#2ecc71', gradient: ['#e8f5e9', '#ffffff'], user: '#2ecc71', bot: '#c8e6c9', input: '#c8e6c9', text: '#1A1A1A' },
    { primary: '#f39c12', gradient: ['#fff3e0', '#ffffff'], user: '#f39c12', bot: '#ffe0b2', input: '#ffe0b2', text: '#1A1A1A' },
    { primary: '#7f8c8d', gradient: ['#eceff1', '#cfd8dc'], user: '#7f8c8d', bot: '#b0bec5', input: '#b0bec5', text: '#1A1A1A' },
    { primary: '#ff8a65', gradient: ['#fff3e0', '#fbe9e7'], user: '#ff8a65', bot: '#ffccbc', input: '#ffccbc', text: '#1A1A1A' },

    // --- Nature-Inspired Palettes ---
    { primary: '#556b2f', gradient: ['#2e2e2e', '#1a1a1a'], user: '#556b2f', bot: '#4a4a4a', input: '#4a4a4a', text: '#FFFFFF' },
    { primary: '#4682b4', gradient: ['#1c3a50', '#0f1f2b'], user: '#4682b4', bot: '#3a5f7e', input: '#3a5f7e', text: '#FFFFFF' },
    { primary: '#b8860b', gradient: ['#3e2723', '#212121'], user: '#b8860b', bot: '#6d4c41', input: '#6d4c41', text: '#FFFFFF' },
    { primary: '#2e8b57', gradient: ['#004d40', '#00251a'], user: '#2e8b57', bot: '#00695c', input: '#00695c', text: '#FFFFFF' },
    { primary: '#8b4513', gradient: ['#261a0d', '#1a1107'], user: '#8b4513', bot: '#4e342e', input: '#4e342e', text: '#FFFFFF' },
    { primary: '#9acd32', gradient: ['#33691e', '#1b5e20'], user: '#9acd32', bot: '#558b2f', input: '#558b2f', text: '#FFFFFF' },
    { primary: '#00ced1', gradient: ['#00363a', '#001c1e'], user: '#00ced1', bot: '#006064', input: '#006064', text: '#FFFFFF' },
    { primary: '#d2691e', gradient: ['#3e2723', '#2a1b16'], user: '#d2691e', bot: '#5d4037', input: '#5d4037', text: '#FFFFFF' },

    // --- Monochromatic Palettes ---
    { primary: '#81d4fa', gradient: ['#01579b', '#002f6c'], user: '#81d4fa', bot: '#0277bd', input: '#0277bd', text: '#FFFFFF' },
    { primary: '#ef9a9a', gradient: ['#b71c1c', '#7f0000'], user: '#ef9a9a', bot: '#d32f2f', input: '#d32f2f', text: '#FFFFFF' },
    { primary: '#a5d6a7', gradient: ['#1b5e20', '#003300'], user: '#a5d6a7', bot: '#388e3c', input: '#388e3c', text: '#FFFFFF' },
    { primary: '#ce93d8', gradient: ['#4a148c', '#2c003e'], user: '#ce93d8', bot: '#7b1fa2', input: '#7b1fa2', text: '#FFFFFF' },
    { primary: '#b0bec5', gradient: ['#263238', '#102027'], user: '#b0bec5', bot: '#455a64', input: '#455a64', text: '#FFFFFF' },
    { primary: '#fff59d', gradient: ['#f57f17', '#c25e00'], user: '#fff59d', bot: '#fbc02d', input: '#fbc02d', text: '#1A1A1A' },
    { primary: '#ffab91', gradient: ['#d84315', '#a31500'], user: '#ffab91', bot: '#f4511e', input: '#f4511e', text: '#FFFFFF' },
    { primary: '#90a4ae', gradient: ['#fafafa', '#e0e0e0'], user: '#90a4ae', bot: '#cfd8dc', input: '#cfd8dc', text: '#1A1A1A' },

    // --- Unique & Themed Palettes ---
    { primary: '#ffd700', gradient: ['#1a1a1a', '#000000'], user: '#ffd700', bot: '#333333', input: '#333333', text: '#FFFFFF' },
    { primary: '#00ffff', gradient: ['#263238', '#000a12'], user: '#00ffff', bot: '#37474f', input: '#37474f', text: '#FFFFFF' },
    { primary: '#ff69b4', gradient: ['#3e001f', '#2a0015'], user: '#ff69b4', bot: '#880e4f', input: '#880e4f', text: '#FFFFFF' },
    { primary: '#f08080', gradient: ['#2c3e50', '#1a2531'], user: '#f08080', bot: '#4e5d6c', input: '#4e5d6c', text: '#FFFFFF' },
    { primary: '#40e0d0', gradient: ['#00251a', '#004d40'], user: '#40e0d0', bot: '#00796b', input: '#00796b', text: '#FFFFFF' },
    { primary: '#fa8072', gradient: ['#faf3dd', '#fbe9e7'], user: '#fa8072', bot: '#ffccbc', input: '#ffccbc', text: '#1A1A1A' },
    { primary: '#c71585', gradient: ['#ffffff', '#fce4ec'], user: '#c71585', bot: '#f8bbd0', input: '#f8bbd0', text: '#1A1A1A' },
    { primary: '#6a5acd', gradient: ['#1a1a1a', '#0c0c2a'], user: '#6a5acd', bot: '#3949ab', input: '#3949ab', text: '#FFFFFF' },
    { primary: '#deb887', gradient: ['#3e2723', '#2a1b16'], user: '#deb887', bot: '#5d4037', input: '#5d4037', text: '#FFFFFF' },
    { primary: '#6495ed', gradient: ['#e3f2fd', '#bbdefb'], user: '#6495ed', bot: '#90caf9', input: '#90caf9', text: '#1A1A1A' },
    { primary: '#ff7f50', gradient: ['#1f1f1f', '#000000'], user: '#ff7f50', bot: '#4e342e', input: '#4e342e', text: '#FFFFFF' },
    { primary: '#bdb76b', gradient: ['#f5f5f5', '#e8eaf6'], user: '#bdb76b', bot: '#e6ee9c', input: '#e6ee9c', text: '#1A1A1A' },
];

const getRandomTheme = () => colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

// --- Optimized Message Component ---
const MessageBubble = React.memo(({ item, theme }) => {
    const isBot = item.sender === 'bot';
    const renderFormattedText = (text) => {
        const parts = text.split('**');
        return (
            <Text style={styles.messageText}>
                {parts.map((part, index) => (
                    index % 2 === 1 ?
                    <Text key={index} style={{ fontFamily: 'JosefinSans-Bold', color: theme.primary }}>{part}</Text> :
                    part
                ))}
            </Text>
        );
    };

    return (
        <Animated.View entering={FadeInUp}>
            <View style={[
                styles.messageBubble,
                isBot ? styles.botBubble : styles.userBubble,
                { backgroundColor: isBot ? theme.bot : theme.user }
            ]}>
                {renderFormattedText(item.text)}
            </View>
        </Animated.View>
    );
});


const Chatbot = () => {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [aiContext, setAiContext] = useState('');
    const [dataLoading, setDataLoading] = useState(true);
    const [theme, setTheme] = useState(getRandomTheme());
    const flatListRef = useRef();

    useEffect(() => {
        setTheme(getRandomTheme());
        const fetchDataForAI = async () => {
            try {
                const coursesCollectionRef = collection(db, "CourseData");
                const coursesSnapshot = await getDocs(coursesCollectionRef);
                const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const developerData = [
                    { id: '1', name: 'Md Solaiman Islam Shadhin', description: 'Lead React Native and React JS developer specializing in UI/UX and full stack Mobile app and Web development' },
                    { id: '2', name: 'Sabekun Nahar Chowdhury', description: 'Lead UI/UX designer.' },
                    { id: '3', name: 'Md Mahamud Hasan', description: 'Firebase specialist and developer.' },
                    { id: '4', name: 'Md Tanvir Alam', description: 'UI/UX designer and front-end developer.' },
                ];
                const appInfoContext = `UNISOL is an educational app. Contact Information: Phone - 01882808626, Facebook - www.facebook.com/sis8952/.`;
                const appFlowContext = `How the app works: Users browse courses on the Home page. To buy, they tap a course to see details, then can "Add to Cart" or "Buy Now". Payment is via Card, bKash, or Nagad. Purchased courses appear in "My Classes" for video viewing.`;
                const developerContext = JSON.stringify(developerData);
                const courseContext = JSON.stringify(coursesList);

                const fullContext = `
                    **Your Knowledge Base:**
                    - **About UNISOL & How to Contact:** ${appInfoContext}
                    - **How the App Works:** ${appFlowContext}
                    - **The Developers:** ${developerContext}
                    - **Available Courses (Full Details):** ${courseContext}
                `;
                setAiContext(fullContext);

            } catch (error) {
                console.error("Error fetching data for chatbot:", error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchDataForAI();

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const chatQuery = query(collection(db, "users", user.uid, "chatMessages"), orderBy("createdAt", "asc"));
                const unsubscribeFirestore = onSnapshot(chatQuery, (querySnapshot) => {
                    const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    if (history.length === 0) {
                        setMessages([{ id: '1', text: 'Hello! As a logged-in user, your chat history will be saved. How can I help?', sender: 'bot' }]);
                    } else {
                        setMessages(history);
                    }
                });
                return () => unsubscribeFirestore();
            } else {
                setMessages([{ id: '1', text: 'Hello! I am the UNISOL assistant. As a guest, your chat will not be saved. How can I help?', sender: 'bot' }]);
            }
        });

        return () => unsubscribeAuth();
    }, []);


    const handleSend = async () => {
        if (input.trim().length === 0 || dataLoading) return;
        const userMessageText = input;
        const command = userMessageText.trim().toLowerCase();
        setInput('');
        const currentUser = auth.currentUser;

        // --- NEW: Command to close the app ---
        if (command === 'close the app' || command === 'exit app' || command === 'quit') {
            const closingMessage = { id: Date.now().toString(), text: "Certainly. Closing the app now. Goodbye!", sender: 'bot' };
            setMessages(prev => [...prev, closingMessage]);
            // Use a short delay to allow the message to render before the app closes
            setTimeout(() => {
                BackHandler.exitApp(); // This will only work on Android
            }, 1000);
            return;
        }

        if (command === 'clear everything') {
            const resetMessage = { id: '1', text: 'Your chat history has been cleared. How can I help you?', sender: 'bot' };
            if (currentUser) {
                setLoading(true);
                const chatMessagesRef = collection(db, "users", currentUser.uid, "chatMessages");
                const querySnapshot = await getDocs(chatMessagesRef);
                const batch = writeBatch(db);
                querySnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                setMessages([resetMessage]);
                setLoading(false);
            } else {
                setMessages([resetMessage]);
            }
            return;
        }

        const newUserMessage = { id: Date.now().toString(), text: userMessageText, sender: 'user' };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);

        if (currentUser) {
            addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: userMessageText, sender: 'user', createdAt: serverTimestamp() });
        }

        setLoading(true);
        try {
            const systemInstruction = {
                role: "system",
                parts: [{ text: `You are UNISOL's expert customer support assistant.
                
                **Your Knowledge Base (Primary Source):**
                ${aiContext}

                **Your Answering Style & Rules:**
                1.  **Prioritize Knowledge Base:** For questions related to UNISOL, courses, developers, or how the app works, you MUST use the provided knowledge base.
                2.  **Use General Knowledge:** For questions not related to UNISOL, use your own extensive knowledge.
                3.  **Be Conversational & Context-Aware:** Remember previous messages to answer follow-up questions.
                4.  **Navigation Commands:** If a navigation action is required, your ENTIRE response must be ONLY the JSON object and nothing else.
                 - **General Pages:**
                   - Home -> "/(tabs)/Home"
                   - My Classes -> "/(tabs)/Class"
                   - Profile -> "/(tabs)/Profile"
                   - Cart -> "/(tabs)/Cart"
                    - Developer -> "/Developer"
                  - Contact Us -> "/ContactUs"
                 - **Specific Course Pages:**
                   - To view details before buying: format the route as "/ViewDetails/[id]".
                   - To watch or open a course: your ONLY action is to navigate them to the main class page using this exact route: \`{"action": "navigate", "route": "/(tabs)/Class"}\`.
                5.  **Formatting:** Use Markdown. **Bold** important terms.
                `}]
            };

            const conversationHistoryForAPI = updatedMessages.map(msg => ({
                role: msg.sender === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }));
            
            const payload = { 
                contents: conversationHistoryForAPI,
                systemInstruction: systemInstruction,
             };
            const apiKey = "AIzaSyAc7leNWBA-cCjAz6PjejX0o6bOZfIdu7o";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate?.content?.parts?.[0]?.text) {
                const botResponseText = candidate.content.parts[0].text;
                
                const jsonMatch = botResponseText.match(/{[\s\S]*}/);
                let isNavigating = false;

                if (jsonMatch && jsonMatch[0]) {
                    try {
                        const responseJson = JSON.parse(jsonMatch[0]);
                        if (responseJson.action === 'navigate' && responseJson.route) {
                            isNavigating = true; 
                            router.push(responseJson.route);
                        }
                    } catch (e) {
                        isNavigating = false;
                    }
                }
                
                if (!isNavigating) {
                    if (currentUser) {
                        await addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: botResponseText, sender: 'bot', createdAt: serverTimestamp() });
                    } else {
                        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' }]);
                    }
                }

            } else { throw new Error("No response from API"); }
        } catch (error) {
            console.error("Gemini API error:", error);
            const errorMessageText = "Sorry, I'm having trouble connecting. Please try again later.";
            if (currentUser) {
                await addDoc(collection(db, "users", currentUser.uid, "chatMessages"), { text: errorMessageText, sender: 'bot', createdAt: serverTimestamp() });
            } else {
                setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: errorMessageText, sender: 'bot' }]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient style={{ flex: 1 }} colors={theme.gradient}>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                  
                >
                    <View style={styles.headerContainer}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.header, { color: theme.primary }]}>UNISOL Assistant</Text>
                        <View style={styles.headerButton} />
                    </View>
                    
                    <View style={styles.chatContainer}>
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={({ item }) => <MessageBubble item={item} theme={theme} />}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 }}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        />
                        {loading && <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 8 }} />}
                    </View>
                    
                    <View style={[styles.inputContainer, { borderTopColor: theme.input }]}>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder={dataLoading ? "Learning about UNISOL..." : "Ask about a course..."}
                            placeholderTextColor={theme.primary + '80'}
                            style={[styles.input, { backgroundColor: theme.input, color: theme.text }]}
                            editable={!dataLoading}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={loading || input.trim().length === 0 || dataLoading}
                            style={[styles.sendButton, { backgroundColor: (input.trim().length === 0 || dataLoading) ? 'gray' : theme.primary }]}
                        >
                            <Ionicons name="send" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 10,
    },
    headerButton: {
        width: 40,
    },
    header: {
        fontSize: 24,
        fontFamily: 'Cinzel-Bold',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
    },
    messageText: {
        fontSize: 16,
        fontFamily: 'JosefinSans-Regular',
        color: 'white',
        lineHeight: 24,
    },
    messageBubble: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginVertical: 5,
        maxWidth: '85%',
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 5,
    },
    botBubble: {
        alignSelf: 'flex-start',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    input: {
        flex: 1,
        borderRadius: 25,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'JosefinSans-Regular',
        marginRight: 8,
    },
    sendButton: {
        padding: 12,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Chatbot;