importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB46Sz62UYBgx7xv8dhyYxeQ-Yyd0r6c_s",
  projectId: "sponic-hr",
  messagingSenderId: "G-R4KQ5VK9FW",
  appId: "1:381369065854:web:485a01dfa1bd884db2132f",
});

const messaging = firebase.messaging();

// 🔥 Background notification handler
messaging.onBackgroundMessage(function (payload) {
  console.log("Background message:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
  });
});
