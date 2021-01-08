onst crypto = require("crypto");
class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.newBlock();
        this.peers = new Set();
    }

    /**
     * Adds a node to our peer table
     */
    addPeer(host) {
        this.peers.add(host);
    }

    /**
     * Adds a node to our peer table
     */
    getPeers() {
        return Array.from(this.peers);
    }

    /**
     * Creates a new block containing any outstanding transactions
     *
     * @param previousHash: the hash of the previous block
     * @param nonce: the random string used to make this block hash satisfy the difficulty requirements
     */
    newBlock(previousHash, nonce = null) {
        let block = {
@@ -23,7 +35,7 @@ class Blockchain {
            nonce
        };

        block.hash = this.hash(block);
        block.hash = Blockchain.hash(block);

        console.log(`Created block ${block.index}`);

@@ -36,15 +48,14 @@ class Blockchain {

    /**
     * Generates a SHA-256 hash of the block
     * @param block
     */
    hash(block) {
    static hash(block) {
        const blockString = JSON.stringify(block, Object.keys(block).sort());
        return crypto.createHash("sha256").update(blockString).digest("hex");
    }

    /**
     * Gets the last block in the chain
     * Returns the last block in the chain
     */
    lastBlock() {
        return this.chain.length && this.chain[this.chain.length - 1];
@@ -56,14 +67,14 @@ class Blockchain {
     * @param hashOfBlock: the hash of the block (hex string)
     * @param difficulty: an integer defining the difficulty
     */
    powIsAcceptable(hashOfBlock, difficulty) {
        return hashOfBlock.slice(0, difficulty) == "0".repeat(difficulty);
    static powIsAcceptable(hashOfBlock, difficulty) {
        return hashOfBlock.slice(0, difficulty) === "0".repeat(difficulty);
    }

    /**
     * Generates a random 32 byte string
     */
    nonce() {
    static nonce() {
        return crypto.createHash("sha256").update(crypto.randomBytes(32)).digest("hex");
    }

@@ -72,24 +83,20 @@ class Blockchain {
     *
     * We hash the block with random string until the hash begins with
     * a "difficulty" number of 0s.
     *
     * @param _block: the block to be mined (defaults to the last block)
     * @param difficulty: the mining difficulty to use
     */
    proofOfWork(_block = null, difficulty = 4) {
        const block = _block || this.lastBlock();
    mine(blockToMine = null, difficulty = 4) {
        const block = blockToMine || this.lastBlock();

        while (true) {
            block.nonce = this.nonce();
            if (this.powIsAcceptable(this.hash(block), difficulty)) {
            block.nonce = Blockchain.nonce();
            if (Blockchain.powIsAcceptable(Blockchain.hash(block), difficulty)) {
                console.log("We mined a block!")
                console.log(` - Block hash: ${this.hash(block)}`);
                console.log(` - Block hash: ${Blockchain.hash(block)}`);
                console.log(` - nonce:      ${block.nonce}`);
                return block;
            }
        }
    }
}

const blockchain = new Blockchain();
blockchain.proofOfWork(null, 5);
module.exports = Blockchain;
37 js/index.js
@@ -0,0 +1,37 @@
const Blockchain = require("./blockchain");
const {send} = require("micro");

const blockchain = new Blockchain();


module.exports = async (request, response) => {
    const route = request.url;

    // Keep track of the peers that have contacted us
    blockchain.addPeer(request.headers.host);

    let output;

    switch (route) {
        case "/new_block":
            output = blockchain.newBlock();
            break;

        case "/last_block":
            output = blockchain.lastBlock();
            break;

        case "/get_peers":
            output = blockchain.getPeers();
            break;

        case "/submit_transaction":
            output = blockchain.addTransaction(transaction);
            break;

        default:
            output = blockchain.lastBlock();

    }
    send(response, 200, output);
};
566 js/package-lock.json

Large diffs are not rendered by default.
8 js/package.json
@@ -4,14 +4,14 @@
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
    "dev": "nodemon blockchain.js",
    "server": "micro-dev"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "micro": "^9.3.4",
    "micro-dev": "^3.0.0",
    "nodemon": "^1.19.0"
  },
  "scripts": {
    "dev": "nodemon blockchain.js"
  }
}
