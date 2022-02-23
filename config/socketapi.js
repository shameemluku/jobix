const io = require( "socket.io" )();
const socketapi = {
    io: io
};

// // Add your socket.io logic here!
// io.on( "connection", function( socket ) {

//     socket.emit('message' , socket.id);
//     console.log( "A user connected" );

//     socket.on('chatmessage',msg=>{
//         io.emit('message',msg)
//     })

// });
// // end of socket.io logic

module.exports = socketapi;