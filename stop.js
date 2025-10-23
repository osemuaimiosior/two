import { createLibp2p } from 'libp2p'; // Node/peer creation protocol
import { webSockets } from '@libp2p/websockets'; //Transport protocol
import { noise } from '@chainsafe/libp2p-noise'; // Encryption protocol
import { yamux } from '@chainsafe/libp2p-yamux' // Multiplexing protocol

const options = {
  start: false,
  addresses: {
    listen: ['/ip4/127.0.0.1/tcp/8000/ws']
  },
  transports: [webSockets()],
  streamMuxers: [yamux()],
  connectionEncrypters: [noise()]
}

// create libp2p
const node = await createLibp2p(options);

// stop libp2p
await node.stop()
console.log('libp2p has stopped')