// Chat.js or Chat.jsx
"use client";

import { useState, useEffect } from 'react';
import styles from './chat.module.css';
import emotionConfig from './emotionConfig'; // Import the emotion configurations
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const MAX_MESSAGES = 3;

// Predefined instructions for each emotion
const emotionInstructions = {
    angry: 'Try to sound angry',
    excited: 'Try to sound excited',
    happy: 'Try to sound happy',
    sad: 'Try to sound sad',
};

const getRandomInstruction = (currentSentiment) => {
    const validSentiments = Object.keys(emotionInstructions);
    const availableSentiments = validSentiments.filter(
        (sent) => sent !== currentSentiment
    );
    const randomSentiment =
        availableSentiments[
            Math.floor(Math.random() * availableSentiments.length)
            ];
    return emotionInstructions[randomSentiment];
};

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sentiment, setSentiment] = useState(null);

    // Set the initial message after the component mounts on the client
    useEffect(() => {
        const initialInstruction = getRandomInstruction(null);
        setMessages([{ role: 'system', content: initialInstruction }]);
    }, []); // This effect runs only once, after the initial render

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        const userMessageCount = newMessages.filter((msg) => msg.role === 'user').length;
        if (userMessageCount >= MAX_MESSAGES) {
            const resetInstruction = getRandomInstruction(sentiment);

            // Only reset the messages but keep the current sentiment to maintain animations
            setMessages([{ role: 'system', content: resetInstruction }]);

            // No need to reset sentiment, let the animation continue
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/categorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            if (response.ok) {
                const returnedSentiment = data.sentiment?.trim().toLowerCase();
                const instruction = getRandomInstruction(
                    returnedSentiment || sentiment
                );

                setMessages((prev) => [
                    ...prev,
                    { role: 'system', content: instruction },
                ]);

                const validSentiments = ['angry', 'excited', 'happy', 'sad'];
                if (validSentiments.includes(returnedSentiment)) {
                    setSentiment(returnedSentiment); // Change sentiment
                }
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'system', content: 'Error: ' + data.error },
                ]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'system', content: 'Error: Unable to categorize message.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const currentEmotionConfig = sentiment ? emotionConfig[sentiment] : null;

    return (
        <>
            <div className={styles.backgroundWrapper}>
                <TransitionGroup component={null}>
                    {sentiment && (
                        <CSSTransition key={sentiment} timeout={500} classNames="fade">
                            <div className={styles.animationWrapper}>
                                <dotlottie-player
                                    src={currentEmotionConfig?.animationUrl}
                                    background="transparent"
                                    speed="1"
                                    loop="true"
                                    autoplay="true"
                                    style={{ width: '100%', height: '100%' }}
                                ></dotlottie-player>
                            </div>
                        </CSSTransition>
                    )}
                </TransitionGroup>
            </div>

            <div
                className={`${styles.chatContainer} ${
                    currentEmotionConfig?.additionalClass || ''
                }`}
                style={{ backgroundColor: 'transparent' }}
            >
                <div className={styles.messages}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={
                                msg.role === 'user' ? styles.userMessage : styles.systemMessage
                            }
                        >
                            <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong>{' '}
                            {msg.content}
                        </div>
                    ))}
                    {loading && (
                        <div className={styles.systemMessage}>
                            <strong>Bot:</strong> Processing...
                        </div>
                    )}
                </div>

                <div className={styles.inputArea}>
                    <div className={styles.lottieContainer}>
                        <TransitionGroup component={null}>
                            {sentiment && (
                                <CSSTransition key={sentiment} timeout={500} classNames="fade">
                                    <div className={styles.characterAnimationWrapper}>
                                        <dotlottie-player
                                            src={
                                                currentEmotionConfig?.characterAnimationUrl ||
                                                'https://lottie.host/a88c0b17-5b5e-43ad-b451-8d1bcbea8a97/biRhSE9MUX.json'
                                            }
                                            background="transparent"
                                            speed="1"
                                            loop="true"
                                            autoplay="true"
                                            style={{ width: '150%', height: '150%' }}
                                        ></dotlottie-player>
                                    </div>
                                </CSSTransition>
                            )}
                        </TransitionGroup>
                    </div>

                    <div className={styles.inputWithButton}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSend();
                                }
                            }}
                            placeholder="Type your message..."
                            disabled={loading}
                            className={styles.inputField}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className={
                                loading
                                    ? `${styles.sendButton} ${styles.sendButtonDisabled}`
                                    : styles.sendButton
                            }
                        >
                            {loading ? '...' : '🚀'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chat;
