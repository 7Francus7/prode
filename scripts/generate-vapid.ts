import webPush from "web-push";

const keys = webPush.generateVAPIDKeys();

console.log("VAPID_PUBLIC_KEY=");
console.log(keys.publicKey);
console.log("");
console.log("VAPID_PRIVATE_KEY=");
console.log(keys.privateKey);
console.log("");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=");
console.log(keys.publicKey);
console.log("");
console.log("VAPID_EMAIL=admin@example.com");
