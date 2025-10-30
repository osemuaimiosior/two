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
import { liDARDataProcessing } from '../services/parietalData';

const brainBoxPlTopic = "brainBox/parietal/liDAR";
const brainBoxCaTopic = "brainBox/parietal/camera";
const brainBoxSubTopic = "brainBox";

const datastore = new LevelDatastore('./data/liDAR-db')
await datastore.open() // level database must be ready before node boot


const cameraNode = await createLibp2p({
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
        emitSelf: false,                                  // whether the cameraNode should emit to self on publish
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

cameraNode.services.pubsub.subscribe(brainBoxSubTopic);
cameraNode.services.pubsub.subscribe(brainBoxCaTopic);

cameraNode.addEventListener('peer:discovery', async (evt) => {
    console.log('Discovered:', evt.detail.id.toString());
    console.log('Connected to:', evt.detail);
});

cameraNode.services.pubsub.addEventListener('message', async (evt) => {

  switch(evt.detail.topic){
    case 'brainBox':
      
    break;

    case 'brainBox/parietal/camera':

    //sample incoming data
    // {
    //   "timestamp": 1730191823.541,
    //   "camera_id": "front_center",
    //   "image": "base64encodedimage...",
    //   "objects_detected": [
    //     {"label": "car", "confidence": 0.94, "bbox": [312, 245, 480, 390]},
    //     {"label": "pedestrian", "confidence": 0.88, "bbox": [190, 230, 220, 360]}
    //   ]
    // }


      const result = await liDARDataProcessing(evt.detail.data);
      console.log(`cameraNode received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
    
    break;
  };
  
});