const { io } = require("socket.io-client");
const readline = require("readline");

const socket = io("http://localhost:5000");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let username = "";

// ✅ Helper to format timestamps
function formatTimestamp(ts) {
    const date = new Date(ts);
    return date.toLocaleTimeString();
}

socket.on("connect", () => {
    console.log("✅ Connected to chat server");
    rl.question("Enter your name: ", (name) => {
        username = name;
        console.log(`Welcome, ${username}! Type messages:`);
    });
});

socket.on("chatHistory", (msgs) => {
    if (msgs.length > 0) {
        console.log("\n📜 Chat History:");
        msgs.forEach(msg => {
            console.log(`[${formatTimestamp(msg.timestamp)}] ${msg.user}: ${msg.text}`);
        });
        console.log("-----");
    }
});

socket.on("receiveMessage", (msg) => {
    if (msg.user !== username) {
        console.log(`\n[${formatTimestamp(msg.timestamp)}] ${msg.user}: ${msg.text}`);
    }
});

rl.on("line", (input) => {
    if (input.trim()) {
        socket.emit("sendMessage", { user: username, text: input });
    }
});
