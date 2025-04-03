self.addEventListener("install", (event) => {
    console.log("Service Worker installed");
    // noinspection JSVoidFunctionReturnValueUsed
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", () => {
    console.log("Service Worker activated");
});

self.addEventListener("fetch", (event) => {
    console.log("Intercepting fetch request:", event.request.url);
});
