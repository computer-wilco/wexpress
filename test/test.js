import wexpress from '../main.js';
import { join } from "path";

const dirname = import.meta.dirname;
const port = "8080";

wexpress.initialize();
wexpress.initializePages(join(dirname, "public"));
wexpress.createServer();
const io = wexpress.returnSocketIO();
// IO is een socket.io server.
io.on("connection", function(socket) {
    socket.on("iets", function () {
        socket.emit("veranderen");
    });
});
wexpress.listenServer(port);
