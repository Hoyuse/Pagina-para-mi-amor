// Import the functions you need from the SDKs you need
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
        import { getDatabase, ref, push, onValue, set, update, get, remove } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCWZn00LhQDH1dyCNujbtzJqDl0LHspWUk",
            authDomain: "cleidis.firebaseapp.com",
            databaseURL: "https://cleidis-default-rtdb.firebaseio.com/",
            projectId: "cleidis",
            storageBucket: "cleidis.firebasestorage.app",
            messagingSenderId: "893148781856",
            appId: "1:893148781856:web:82987a76b41f971fea8b45",
            measurementId: "G-JJNJZK5BG0"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const database = getDatabase(app);

        // Hacer la base de datos accesible globalmente para las funciones de index.html
        window.db = database;
        window.dbRef = ref;
        window.dbPush = push;
        window.dbSet = set;
        window.dbUpdate = update;
        window.dbGet = get;
        window.dbOnValue = onValue;
        window.dbRemove = remove;