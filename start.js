import { createLibp2p } from 'libp2p'; // Node/peer creation protocol
import { webSockets } from '@libp2p/websockets'; //Transport protocol
import { noise } from '@chainsafe/libp2p-noise'; // Encryption protocol
import { yamux } from '@chainsafe/libp2p-yamux'; // Multiplexing protocol
import { bootstrap } from '@libp2p/bootstrap'; //Peer discovery: For joining a public network.

// Known peers addresses
const bootstrapMultiaddrs = [
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'
]

const portRange = {
  startRange: 8000,
  endRange: 9000
};

const options = {
  start: false,
  addresses: {
    listen: ['/ip4/127.0.0.1/tcp/8000/ws']
  },
  transports: [webSockets()],
  streamMuxers: [yamux()],
  connectionEncrypters: [noise()],
  peerDiscovery: [
    bootstrap({
      list: bootstrapMultiaddrs, // provide array of multiaddrs
    })
  ]
}

const options2 = {
  start: false,
  addresses: {
    listen: ['/ip4/127.0.0.1/tcp/7000/ws']
  },
  transports: [webSockets()],
  streamMuxers: [yamux()],
  connectionEncrypters: [noise()],
  peerDiscovery: [
    bootstrap({
      list: bootstrapMultiaddrs, // provide array of multiaddrs
    })
  ]
}

// create libp2p
const node = await createLibp2p(options);
const node2 = await createLibp2p(options2);

// start libp2p
await node.start()
await node2.start()
console.log('libp2p has started')

const listenAddresses = node.getMultiaddrs()
const listenAddresses2 = node2.getMultiaddrs()
console.log('libp2p is listening on the following addresses: ', listenAddresses[0].toString())
console.log('libp2p is listening on the following addresses: ', listenAddresses2[0].toString())

node.addEventListener('peer:discovery', (evt) => {
  console.log('Discovered %s', evt.detail.id.toString()) // Log discovered peer
  console.log('Discovered peer details %s', evt.detail) // Log discovered peer details
})

node.addEventListener('peer:connect', (evt) => {
  console.log('Connected to %s', evt.detail.toString()) // Log connected peer
})

