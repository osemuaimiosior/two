import { mdns } from '@libp2p/mdns';
import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { yamux } from '@chainsafe/libp2p-yamux';
import { noise } from '@chainsafe/libp2p-noise';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
// import { SignaturePolicy } from '@libp2p/interface'
import { identify, identifyPush } from '@libp2p/identify';
import { fromString as uint8ArrayFromString } from 'uint8arrays'
import { toString as uint8ArrayToString } from 'uint8arrays';
import { LevelDatastore } from 'datastore-level';

const datastore = new LevelDatastore('./data/brain-box-db')
await datastore.open() // level database must be ready before node boot

const topic = "mainConnection";

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
      identifyPush: identifyPush(),
      pubsub: gossipsub({
        emitSelf: false,                                  // whether the node should emit to self on publish
        // globalSignaturePolicy: SignaturePolicy.StrictSign // message signing policy
      })
    }
  });

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

node.addEventListener('peer:discovery', async (evt) => {
    console.log('Discovered:', evt.detail.id.toString());
    console.log('Connected to:', evt.detail);
});

heartNode.addEventListener('peer:discovery', async (evt) => {
    console.log('Discovered:', evt.detail.id.toString());
    console.log('Connected to:', evt.detail)
});

const add = heartNode.getMultiaddrs();
await node.dial(add[0]);

node.services.pubsub.subscribe(topic)
heartNode.services.pubsub.subscribe(topic);

// wait for subscriptions to propagate
await hasSubscription(node, heartNode, topic)

const peers = heartNode.services.pubsub.getSubscribers(topic);
console.log(peers);

heartNode.services.pubsub.publish(
  topic, 
  new TextEncoder().encode('Heart beat...'));

node.services.pubsub.addEventListener('message', (evt) => {
  console.log(`node received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
});

heartNode.services.pubsub.addEventListener('message', (evt) => {
  console.log(`heartNode received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
});

const validateMsg = (msgTopic, msg) => {
  const message = uint8ArrayToString(msg.data)
  const validMsg = ['banana', 'apple', 'orange']

  return validMsg.includes(message) ? 'accept' : 'ignore'
};

// validate message
node.services.pubsub.topicValidators.set(topic, validateMsg);
heartNode.services.pubsub.topicValidators.set(topic, validateMsg);

await heartNode.services.pubsub.publish(topic, uint8ArrayFromString("banana"))

console.log('############## all messages sent ##############');

async function delay (ms) {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

// Wait for node1 to see that node2 has subscribed to the topic
async function hasSubscription (node, heartNode, topic) {
  while (true) {
    const subs = await node.services.pubsub.getSubscribers(topic)

    if (subs.map(peer => peer.toString()).includes(heartNode.peerId.toString())) {
      return
    }

    // wait for subscriptions to propagate
    await delay(100)
  }
}