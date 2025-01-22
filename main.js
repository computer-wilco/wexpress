import { join, extname } from "path";
import logginglog from 'logginglog';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';
import express from "express";
import { ip } from 'ipadres';

const wexpress = {};
const dirname = import.meta.dirname;

// Logginglog
const color = logginglog.colors();
const serverlog = logginglog.makeLogger('WExpress', color.rainbow);
// Eind Logginglog

const notfound = JSON.parse(readFileSync(join(dirname, "/json/not_found.json")));
const blocked = JSON.parse(readFileSync(join(dirname, "/json/blocked.json")));

wexpress.app = express();

wexpress.initialize = function () {
    wexpress.app.set('view engine', 'ejs');
    wexpress.app.set('views', join(dirname, "/ejs"));
    wexpress.app.use((req, res, next) => {
        // Controleer of de path geen slash eindigt én geen bestandsextensie heeft
        if (!req.path.endsWith('/') && !extname(req.path)) {
            // Laat routes met queryparameters ongemoeid
            if (Object.keys(req.query).length === 0) {
                return res.redirect(301, req.path + '/');
            }
        }
        next();
    });

    wexpress.app.all('*', (req, res, next) => {
        const url = req.originalUrl.split("?")[0].split("#")[0];
        let startswith = false;
        for(const start of blocked.startswith) { 
        if(url.startsWith(start)){
            startswith = true;
        }
        }
        let endswith = false;
        for(const start of blocked.endswith) {
            if(url.endsWith(start)){
                    endswith = true;
            }
        }
        if (blocked.exact.includes(url) || startswith || endswith) {
            res.status(200).render("error/403", {url: req.originalUrl});
        } else {
        next();
        }
    });
    
    wexpress.app.all('*', (req, res, next) => {
        const url = req.originalUrl.split("?")[0].split("#")[0];
        let startswith = false;
        for(const start of notfound.startswith) {
            if(url.startsWith(start)){
                    startswith = true;
            }
        }
        let endswith = false;
        for(const start of notfound.endswith) {
            if(url.endsWith(start)){
                    endswith = true;
            }
        }
        if (notfound.exact.includes(url) || startswith || endswith) {
            res.status(200).render("error/404", {url: req.originalUrl});
        } else {
            next();
        }
    });
}

wexpress.initializePages = function (pagesURL) {
    wexpress.app.use(express.static(pagesURL));
}

wexpress.createServer = function (PORT, returnSocketIO = false) {
    wexpress.app.all('*', (req, res) => {
        res.status(200).render("error/404", {url: req.originalUrl});
    });

    const server = createServer(wexpress.app);

    server.listen(PORT);

    serverlog(`WExpress server gestart op ${ip}:${PORT}`);

    if (returnSocketIO) {
        const io = new Server(server);
        return io;
    } else {
        return undefined;
    }
}

export default wexpress;
