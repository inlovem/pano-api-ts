// app.js

// 1. Initialize Firebase with your configuration
const firebaseConfig = {
    apiKey: "AIzaSyCreX3ce2H3rsJDtlPwmsWK1RSUlQtNFpE",
    authDomain: "panoculum.firebaseapp.com",
    databaseURL: "https://panoculum-default-rtdb.firebaseio.com",
    projectId: "panoculum",
    storageBucket: "panoculum.firebasestorage.app",
    messagingSenderId: "1007171032719",
    appId: "1:1007171032719:web:2b37b51865ffbe306dc2fa"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// 2. Get references to the DOM elements
const signInBtn = document.getElementById("sign-in-btn");
const createPostcardBtn = document.getElementById("create-postcard-btn");
const outputDiv = document.getElementById("output");

// 3. Set up the Google sign-in provider
const provider = new firebase.auth.GoogleAuthProvider();

// 4. Sign in with Google on button click
signInBtn.addEventListener("click", () => {
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            outputDiv.innerHTML = `<p>Signed in as: ${user.displayName} (${user.email})</p>`;
            // Enable the create postcard button after successful sign-in
            createPostcardBtn.disabled = false;
        })
        .catch((error) => {
            console.error("Error during sign-in:", error);
            outputDiv.innerHTML = `<p>Error signing in: ${error.message}</p>`;
        });
});

// 5. On clicking "Create Postcard", get the ID token and call the backend endpoint
createPostcardBtn.addEventListener("click", () => {
    // Force a refresh of the token to ensure it's up-to-date.
    auth.currentUser.getIdToken(/* forceRefresh */ true)
        .then((idToken) => {
            // Prepare the payload for creating a new postcard
            const payload = {
                data: {
                    type: "postCard",
                    attributes: {
                        s3Key: "example-s3-key",
                        transcript: "This is the postcard transcript."
                    }
                }
            };

            // Call the backend endpoint with the token in the Authorization header
            return fetch("http://localhost:3000/postcard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + idToken
                },
                body: JSON.stringify(payload)
            });
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            console.log("Backend response:", data);
            outputDiv.innerHTML += `<p>Postcard Created: ${JSON.stringify(data)}</p>`;
        })
        .catch((error) => {
            console.error("Error creating postcard:", error);
            outputDiv.innerHTML += `<p>Error: ${error.message}</p>`;
        });
});
