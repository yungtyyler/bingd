self.addEventListener("push", (event) => {
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { title: "bingd.", body: event.data.text() };
    }
  }

  const title = payload.title || "bingd.";
  const options = {
    body: payload.body || "A show on your list has an update.",
    icon: "/green_bingd_logo.png",
    badge: "/green_bingd_logo.png",
    data: {
      url: payload.url || "/dashboard",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client && client.url.endsWith(url)) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});
