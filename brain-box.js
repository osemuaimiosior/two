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

//<============================ Broker Subcription Topic's ==================================>//
const parietalLiDARTopic = 'parietal/liDAR';
const parietalCameraTopic = 'parietal/camera';
const parietalGpsTopic = 'parietal/gps';
const parietalImuTopic = 'parietal/imu';
const parietalWeatherTopic = 'parietal/weather';
const parietalvehicleTelTopic = 'parietal/vehicleTel';
//<============================ Broker Subcription Topic's ==================================>//

//<============================ p2p Subcription Topic's ==================================>//
const brainBoxSubTopic = "brainBox";
const brainBoxPlTopic = "brainBox/parietal/liDAR";
const brainBoxCaTopic = "brainBox/parietal/camera";
const brainBoxGpsTopic = "brainBox/parietal/gps";
const brainBoxImuTopic = "brainBox/parietal/imu";
const brainBoxWeatherTopic = "brainBox/parietal/weather";
const brainBoxvehicleTelTopic = "brainBox/parietal/vehicleTel";
//<============================ p2p Subcription Topic's ==================================>//

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

const brainBoxNode = await createLibp2p({
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
        emitSelf: false,                                  // whether the brainBoxNode should emit to self on publish
        // globalSignaturePolicy: SignaturePolicy.StrictSign // message signing policy
      })
    }
  });

client.on('connect', () => {
  console.log('Connected')
  client.subscribe(
      [ parietalLiDARTopic, 
        parietalGpsTopic,
        parietalCameraTopic,
        parietalImuTopic,
        parietalWeatherTopic,
        parietalvehicleTelTopic
      ], () => {
      console.log(`Subscribe to topic '${parietalLiDARTopic}'`)
      console.log(`Subscribe to topic '${parietalGpsTopic}'`)
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

brainBoxNode.services.pubsub.subscribe(brainBoxSubTopic);
brainBoxNode.services.pubsub.subscribe(brainBoxPlTopic);
brainBoxNode.services.pubsub.subscribe(brainBoxCaTopic);
brainBoxNode.services.pubsub.subscribe(brainBoxGpsTopic);
brainBoxNode.services.pubsub.subscribe(brainBoxImuTopic);
brainBoxNode.services.pubsub.subscribe(brainBoxWeatherTopic);
brainBoxNode.services.pubsub.subscribe(brainBoxvehicleTelTopic);

brainBoxNode.addEventListener('peer:discovery', async (evt) => {
    console.log('Discovered:', evt.detail.id.toString());
    console.log('Connected to:', evt.detail);
});

client.on('message', async (topic, payload) => {
  const topicName = topic;
  
  switch(topicName) {

    case 'parietal/liDAR':
      brainBoxNode.services.pubsub.publish(
          brainBoxPlTopic, 
          new TextEncoder().encode(payload.toString()));
    break;

    case 'parietal/camera':
      brainBoxNode.services.pubsub.publish(
          brainBoxCaTopic, 
          new TextEncoder().encode(payload.toString()));
    break;

    case 'parietal/gps':
      brainBoxNode.services.pubsub.publish(
          brainBoxGpsTopic, 
          new TextEncoder().encode(payload.toString()));
    break;

    case 'parietal/imu':
      brainBoxNode.services.pubsub.publish(
          brainBoxImuTopic, 
          new TextEncoder().encode(payload.toString()));
    break;

    case 'parietal/weather':
      brainBoxNode.services.pubsub.publish(
          brainBoxWeatherTopic, 
          new TextEncoder().encode(payload.toString()));
    break;

    case 'parietal/vehicleTel':
      brainBoxNode.services.pubsub.publish(
          brainBoxvehicleTelTopic, 
          new TextEncoder().encode(payload.toString()));
    break;
  };

});

brainBoxNode.services.pubsub.addEventListener('message', (evt) => {
  console.log(`brainBoxNode received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
});