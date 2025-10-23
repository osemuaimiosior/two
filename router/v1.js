import express from 'express';
import { createNodeCluster } from '../controllers/nodeCluster.js';

const router = express.Router();

router.post('/createNodeCluster/:NUMBER_OF_NODES', createNodeCluster);

export default router;