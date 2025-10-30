import dotenv from 'dotenv';
dotenv.config();

import asyncHandler from 'express-async-handler';
import { createLibp2p } from 'libp2p'; // Node/peer creation protocol
import { webSockets } from '@libp2p/websockets'; //Transport protocol
import { noise } from '@chainsafe/libp2p-noise'; // Encryption protocol
import { yamux } from '@chainsafe/libp2p-yamux'; // Multiplexing protocol
import { bootstrap } from '@libp2p/bootstrap'; //Peer discovery: For joining a public network.

const portRange = {
  startRange: 8000,
  endRange: 9000
};

let port = 8000;

// Known peers addresses
const bootstrapMultiaddrs = [
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'
]

export const createNodeCluster = asyncHandler( async (req, res) => {
    const nosNodes = parseInt(req.params.NUMBER_OF_NODES, 10);
    
    if(nosNodes < 2 || nosNodes > 50){
        return res.json({
            "StatusCode": 400,
            "Message": "failed",
            "Data": { 
                "details": "Number of nodes to create must be greater than two(2) or less than 50 nodes."
            }
        });
    }

    for (let i = 0; i < nosNodes; i++) {
        if(port === 9999){

        } else {
            port++;
        };

        const options = {
            start: false,
            addresses: {
                listen: [`/ip4/127.0.0.1/tcp/${port}/ws`]
            },
            transports: [webSockets()],
            streamMuxers: [yamux()],
            connectionEncrypters: [noise()],
            peerDiscovery: [
                bootstrap({
                list: bootstrapMultiaddrs, // provide array of multiaddrs
                })
            ]
        };

        const node = await createLibp2p(options);

        await node.start();

        const listenAddresses = node.getMultiaddrs();
        console.log(`Node ${i} listening on:`, listenAddresses.map(a => a.toString()));

        node.addEventListener('peer:discovery', (evt) => {
            console.log(`Node ${i} discovered ${evt.detail.id.toString()}`);
        });

        node.addEventListener('peer:connect', (evt) => {
            console.log(`Node ${i} connected to ${evt.detail.toString()}`);
        });
    };

    return res.json({
        "StatusCode": 200,
        "Message": "success",
        "Data": { 
            "details": "Done"
        }
    });
});
