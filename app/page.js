// app/page.js

import Chat from './components/chat';
import styles from './page.module.css';

export const metadata = {
    title: 'Sentiment Chat',
    description: 'A simple sentiment categorization chat app.',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function Home() {
    return (
        <div>

            <main className={styles.container}>
                <h1 className={styles.title}></h1>
                <Chat/>

            </main>
        </div>
    );
}
