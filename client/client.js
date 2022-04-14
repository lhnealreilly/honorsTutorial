const connectButton = document.getElementById('socketConnect');
const disconnectButton = document.getElementById('socketDisconnect');
const docID = document.getElementById('docID');
const docField = document.getElementById('textBody');
const docTitle = document.getElementById('title');

let socket = null;
let currDocID = null; //The name of the current document

connectButton.addEventListener('click', (e) => {
    if (docID.value === '') {
        alert('Please enter a document to work on');
    }
    else {
        //If we are going to connect to a new document, first we will disconnect from the old one
        if (socket != null) {
            socket.send(JSON.stringify({ type: 'disconnect' }));
            socket.close();
        }
        //We initiate a new socket
        socket = new WebSocket('ws://localhost:8080');
        let docIDValue = docID.value;
        socket.addEventListener('open', e => {
            //When the socket is established, we are going to send an initial connect message
            socket.send(JSON.stringify({ type: 'connect', value: docIDValue }));
            currDocID = docIDValue;
        });
        //When we recieve a message from the server, we will put it into the document field
        socket.addEventListener('message', function (e) {
            docField.value = e.data;
        });
        //Reset some of the fields and show the disconnect button
        disconnectButton.hidden = false;
        docTitle.innerHTML = docID.value;
        docID.value = "";
    }
});

disconnectButton.addEventListener('click', (e) => {
    if (socket !== null) {
        socket.send(JSON.stringify({ type: 'disconnect'}));
        socket.close();
        socket = null;
    }
    //Reset some of the fields and hide the disconnect button
    disconnectButton.hidden = true;
    docTitle.innerHTML = "";
    docField.value = "";
});

docField.addEventListener('keyup', (e) =>{
    //If there is typing in the box and we have a socket, we are going to send the value to the server
    if(socket !== null){
        socket.send(JSON.stringify({type: 'text', value: docField.value}))
    }
});
