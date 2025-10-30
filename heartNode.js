import { mdns } from '@libp2p/mdns'
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { yamux } from '@chainsafe/libp2p-yamux'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
// import { SignaturePolicy } from '@libp2p/interface'
import { identify } from '@libp2p/identify'
import { fromString as uint8ArrayFromString } from 'uint8arrays'
import { toString as uint8ArrayToString } from 'uint8arrays'
import { LevelDatastore } from 'datastore-level';
import mqtt from 'mqtt';

const datastore = new LevelDatastore('./data/heart-node-db')
await datastore.open() // level database must be ready before node boot

const protocol = 'ws'
const host = 'broker.emqx.io'
const port = '8083'
const path = '/mqtt'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${protocol}://${host}:${port}${path}`;

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
})

const fc105102Topic = '/ng/lg/105102' // Nigeria/lagos/fleet code 105102
const fc105103Topic = '/us/ny/105103' // Nigeria/lagos/fleet code 105103

client.on('connect', () => {
  console.log('Connected')
  client.subscribe([fc105102Topic, fc105103Topic], () => {
    console.log(`Subscribe to topic '${fc105102Topic}'`)
    console.log(`Subscribe to topic '${fc105103Topic}'`)
  })
});

client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString());
  const order = JSON.parse(message.toString()) // convert back to JS object
});

// client.on('connect', () => {
//   client.publish(fc105103Topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
//     if (error) {
//       console.error(error)
//     }
//   });

//   client.publish(fc105102Topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
//     if (error) {
//       console.error(error)
//     }
//   })
// })

const topic = "mainConnection";
const heartNode = await createLibp2p({
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/0']
    },
    transports: [
      tcp()
    ],
    streamMuxers: [
      yamux()
    ],
    connectionEncrypters: [
      noise()
    ],
    peerDiscovery: [
      mdns({
        interval: 20e3
      })
    ],
    services: {
      identify: identify(),
      pubsub: gossipsub({
        emitSelf: false,                                  // whether the node should emit to self on publish
        // globalSignaturePolicy: SignaturePolicy.StrictSign // message signing policy
      })
    }
  });

heartNode.services.pubsub.subscribe(topic);

heartNode.addEventListener('peer:discovery', async (evt) => {
  console.log('Discovered:', evt.detail.id.toString());
  console.log('Connected to:', evt.detail)
}
);

heartNode.services.pubsub.addEventListener('message', (evt) => {
  console.log(`heartNode received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
});