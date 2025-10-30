import { mdns } from '@libp2p/mdns';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { yamux } from '@chainsafe/libp2p-yamux';
import { noise } from '@chainsafe/libp2p-noise';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
// import { SignaturePolicy } from '@libp2p/interface'
import { identify } from '@libp2p/identify';
import { fromString as uint8ArrayFromString } from 'uint8arrays'
import { toString as uint8ArrayToString } from 'uint8arrays';
import { LevelDatastore } from 'datastore-level';
import mqtt from 'mqtt';

const parietalTopic = 'parietal/' // Nigeria/lagos/fleet code 105102/brain function
const frontalTopic = 'frontal' // Nigeria/lagos/fleet code 105103/brain function
const mainConnectionSubtopic = "mainConnectionSub";

const datastore = new LevelDatastore('./data/brain-box-db')
await datastore.open() // level database must be ready before node boot

//Public broker detail, change to prod broker
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
});

const node = await createLibp2p({
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
    peerStore: {
      persistence: true,
      threshold: 5
    },
    services: {
      identify: identify(),
      pubsub: gossipsub({
        emitSelf: false,                                  // whether the node should emit to self on publish
        // globalSignaturePolicy: SignaturePolicy.StrictSign // message signing policy
      })
    }
  });


client.on('connect', () => {
  console.log('Connected')
  client.subscribe([parietalTopic, frontalTopic], () => {
    console.log(`Subscribe to topic '${parietalTopic}'`)
    console.log(`Subscribe to topic '${frontalTopic}'`)
  })
});

// const order = {
//   orderId: "ORD-98231",
//   customer: "John Doe",
//   items: [
//     { product: "Brown Rice Protein", quantity: 5, price: 12.50 },
//     { product: "Energy Drink", quantity: 12, price: 2.99 }
//   ],
//   total: 90.38,
//   status: "processing",
//   timestamp: new Date().toISOString()
// }

// const message = JSON.stringify(order)  // convert object to string

// client.on('connect', () => {
//   client.publish(fc105103Topic, message, { qos: 1, retain: false }, (error) => {
//     if (error) {
//       console.error(error)
//     }
//   });

//   client.publish(fc105102Topic, message, { qos: 1, retain: false }, (error) => {
//     if (error) {
//       console.error(error)
//     }
//   })
// })

// client.end();

node.services.pubsub.subscribe(mainConnectionSubtopic)

node.addEventListener('peer:discovery', async (evt) => {
    console.log('Discovered:', evt.detail.id.toString());
    console.log('Connected to:', evt.detail);
});

client.on('message', (topic, payload) => {
  const topicName = topic;
  switch(topicName) {
    case ''
  };
  parietalDataProcessing();
  console.log('Received Message:', topic, payload.toString());

  node.services.pubsub.publish(
    mainConnectionSubtopic, 
    new TextEncoder().encode(payload.toString()))
});

node.services.pubsub.addEventListener('message', (evt) => {
  console.log(`node received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
});