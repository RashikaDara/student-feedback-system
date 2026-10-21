
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Keep your actual values from Firebase Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyDjGw2jDmwoS3vFrSpNXcnav7eGYfK_iJA",
  authDomain: "studentfeedbacksystem-98901.firebaseapp.com",
  projectId: "studentfeedbacksystem-98901",
  storageBucket: "studentfeedbacksystem-98901.firebasestorage.app",
  messagingSenderId: "202990072121",
  appId: "1:202990072121:web:7fc128626a945337d038e8",
  measurementId: "G-2TX13RCGR0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Student feedback form
const form = document.getElementById("feedbackForm");
const message = document.getElementById("message");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const studentName = document.getElementById("studentName").value.trim();
    const course = document.getElementById("course").value.trim();
    const rating = Number(document.getElementById("rating").value);
    const comments = document.getElementById("comments").value.trim();

    if (!studentName || !course || !Number.isInteger(rating) ||
        rating < 1 || rating > 5) {
      message.textContent = "Please complete the required fields.";
      return;
    }

    try {
      await addDoc(collection(db, "feedback"), {
        studentName,
        course,
        rating,
        comments,
        createdAt: serverTimestamp()
      });

      message.textContent = "Feedback submitted successfully!";
      form.reset();
    } catch (error) {
      console.error(error);
      message.textContent =
        "Feedback could not be submitted. Please try again.";
    }
  });
}

// Admin login form (will be added to the HTML in a later step)
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      loginMessage.textContent = "Admin login successful!";
    } catch (error) {
      console.error(error);
      loginMessage.textContent = "Login failed. Check your details.";
    }
  });
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      const loginMessage = document.getElementById("loginMessage");
      if (loginMessage) {
        loginMessage.textContent = "You have logged out.";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}

// Admin-only dashboard
onAuthStateChanged(auth, (user) => {
  const dashboard = document.getElementById("dashboard");
  if (logoutButton) {
    logoutButton.hidden = !user || user.email !== "dararashika@gmail.com";
}
  if (dashboard) {
    dashboard.hidden = !user ||
      user.email !== "dararashika@gmail.com";
  }

  if (!user || user.email !== "dararashika@gmail.com") return;

  const feedbackList = document.getElementById("feedbackList");
  const totalFeedback = document.getElementById("totalFeedback");
  const averageRating = document.getElementById("averageRating");

  const feedbackQuery = query(
    collection(db, "feedback"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(feedbackQuery, (snapshot) => {
    const items = snapshot.docs.map((doc) => doc.data());

    if (totalFeedback) {
      totalFeedback.textContent = String(items.length);
    }

    if (averageRating) {
      const average = items.length
        ? items.reduce((sum, item) => sum + item.rating, 0) / items.length
        : 0;
      averageRating.textContent = average.toFixed(1);
    }

    if (feedbackList) {
      feedbackList.replaceChildren();

      items.forEach((item) => {
        const card = document.createElement("div");
        const heading = document.createElement("h3");
        const details = document.createElement("p");
        const comments = document.createElement("p");

        heading.textContent = item.studentName;
        details.textContent = `${item.course} — Rating: ${item.rating}/5`;
        comments.textContent = item.comments || "No comments provided";

        card.append(heading, details, comments);
        feedbackList.appendChild(card);
      });
    }
  }, (error) => {
    console.error("Dashboard error:", error);
  });
});
