import http, { request } from "http";
import express from "express";
import morgan from "morgan";
import ws from "websocket"

const app = express();

const port = 8080;

app.use(express.static('client'));
app.use(morgan('dev'));

//This redirects to the statically server client files
app.get('/', function(req, res) {
    res.redirect('client/index.html')
});

const server = app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});


let rooms = {};

let wsServer = new ws.server({
    httpServer: server,
});

wsServer.on("request", function(req){
    let connection = req.accept(null, req.origin);
    //Group closure to keep track of the group the socket is in for easy alerting
    let group = [];
    connection.on('open', () => console.log("Connection opened"));
    connection.on('close', () => console.log("Connection closed"));
    connection.on('message', e => {
        //Parse the incoming message
        let parsedJSON = JSON.parse(e.utf8Data);
        switch(parsedJSON.type){
            //If it is a connection, add it to the correct document group
            case('connect'):
                if(rooms[parsedJSON.value] === undefined){
                    rooms[parsedJSON.value] = {data: "", sockets: [connection]}
                }
                else{
                    rooms[parsedJSON.value].sockets.push(connection);
                    connection.send(rooms[parsedJSON.value].data);
                }
                group = rooms[parsedJSON.value];
                break;
            //If it is a disconnet, delete the socket from the group
            case('disconnect'):
                group.sockets.splice(group.sockets.indexOf(connection), 1);
                break;
            //If it is sending text, send the update to the whole group
            case('text'):
                group.data = parsedJSON.value;
                group.sockets.forEach((s) => s.send(group.data));
                break;
        }
    });
});

