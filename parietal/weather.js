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
import { cameraDataProcessing } from '../services/parietalData';

const brainBoxGpsTopic = "brainBox/parietal/weather";
const brainBoxSubTopic = "brainBox";

const datastore = new LevelDatastore('./data/weather-db')
await datastore.open() // level database must be ready before node boot


const gpsNode = await createLibp2p({
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
        emitSelf: false,                                  // whether the gpsNode should emit to self on publish
        // globalSignaturePolicy: SignaturePolicy.StrictSign // message signing policy
      })
    }
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

gpsNode.services.pubsub.subscribe(brainBoxSubTopic);
gpsNode.services.pubsub.subscribe(brainBoxGpsTopic);

gpsNode.addEventListener('peer:discovery', async (evt) => {
    console.log('Discovered:', evt.detail.id.toString());
    console.log('Connected to:', evt.detail);
});

gpsNode.services.pubsub.addEventListener('message', async (evt) => {

  switch(evt.detail.topic){
    case 'brainBox':
      
    break;

    case 'brainBox/parietal/weather':

    //sample incoming data
    // {
    //     "timestamp": 1730191823.723,
    //     "temperature_c": 28.4,
    //     "humidity_percent": 65,
    //     "rain_intensity": "light",
    //     "visibility_m": 4000
    // }


      const result = await cameraDataProcessing(evt.detail.data);
      console.log(`gpsNode received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
    
    break;
  };
  
});