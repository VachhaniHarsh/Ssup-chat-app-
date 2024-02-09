const express = require("express");
const { chats } = require("./data/data.js");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");
const messageRoutes = require("./routes/messageRoutes.js");
const path = require("path");

dotenv.config();
connectDB();
const app = express();

app.use(express.json());



app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// ----------Deployment----------

const _dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(_dirname1, "/frontend/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(_dirname1, "frontend", "build", "index.html"));
    })

    app.get("*", ( req, res ) => {
        res.send("API is running succesfully!");
    });
}
else {
    app.get("/", (req,res) => {
    res.send("Api is running succesfully!");
});
}


// ----------Deployment----------

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
    console.log(`Server stated on PORT ${PORT}`);
});

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000"
    }
});

io.on("connection", (socket) => { 
    console.log("Connected to socket.io!");

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => { 
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on("typing", (room) => {
        socket.in(room).emit("typing");
    });

    socket.on("stop typing", (room) => {
        socket.in(room).emit("stop typing");
    });

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) {
            console.log("chat.users not defined");
            return;
        }

        chat.users.forEach(user => {
            if (user._id == newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message received", newMessageReceived);
        });

    });

    socket.off("setup", () => {
        console.log("User disconnected!");
        socket.leave(userData._id);
    });


});


