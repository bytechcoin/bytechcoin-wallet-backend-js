// Copyright (c) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import {
    TransactionInputJSON, TransactionJSON, transfersToVector,
    UnconfirmedInputJSON,
} from './JsonSerialization';

/**
 * @hidden
 */
export class Block {
    public static fromJSON(json: any): Block {
        const block = Object.create(Block.prototype);

        return Object.assign(block, {
            coinbaseTransaction: RawCoinbaseTransaction.fromJSON(json.coinbaseTX),

            transactions: json.transactions.map(RawTransaction.fromJSON),

            blockHeight: Number(json.blockHeight),

            blockHash: json.blockHash,

            blockTimestamp: Number(json.blockTimestamp),
        });
    }

    /* The coinbase transaction contained in this block */
    public readonly coinbaseTransaction: RawCoinbaseTransaction;

    /* The standard transactions contain in this block (may be empty) */
    public readonly transactions: RawTransaction[];

    /* The height of this block in the block chain */
    public readonly blockHeight: number;

    /* The hash of the block */
    public readonly blockHash: string;

    /* The timestamp of this block */
    public readonly blockTimestamp: number;

    constructor(
        coinbaseTransaction: RawCoinbaseTransaction,
        transactions: RawTransaction[],
        blockHeight: number,
        blockHash: string,
        blockTimestamp: number) {

        this.coinbaseTransaction = coinbaseTransaction;
        this.transactions = transactions;
        this.blockHeight = blockHeight;
        this.blockHash = blockHash;
        this.blockTimestamp = blockTimestamp;
    }
}

/**
 * @hidden
 */
export class RawCoinbaseTransaction {
    public static fromJSON(json: any): RawCoinbaseTransaction {
        const coinbaseTX = Object.create(RawCoinbaseTransaction.prototype);

        return Object.assign(coinbaseTX, {
            keyOutputs: json.outputs.map(KeyOutput.fromJSON),

            hash: json.hash,

            transactionPublicKey: json.txPublicKey,

            unlockTime: Number(json.unlockTime),
        });
    }

    /* The outputs of this transaction */
    public readonly keyOutputs: KeyOutput[];

    /* The hash of this transaction */
    public readonly hash: string;

    /* The public key of this transaction */
    public readonly transactionPublicKey: string;

    /* When this transaction is unlocked for spending - can be interpreted as
       both a block height and a unix timestamp */
    public readonly unlockTime: number;

    constructor(
        keyOutputs: KeyOutput[],
        hash: string,
        transactionPublicKey: string,
        unlockTime: number) {

        this.keyOutputs = keyOutputs;
        this.hash = hash;
        this.transactionPublicKey = transactionPublicKey;
        this.unlockTime = unlockTime;
    }
}

/**
 * @hidden
 */
export class RawTransaction extends RawCoinbaseTransaction {
    public static fromJSON(json: any): RawTransaction {
        const coinbaseTX = Object.create(RawTransaction.prototype);

        return Object.assign(coinbaseTX, {
            keyOutputs: json.outputs.map(KeyOutput.fromJSON),

            hash: json.hash,

            transactionPublicKey: json.txPublicKey,

            unlockTime: Number(json.unlockTime),

            paymentID: json.paymentID,

            keyInputs: json.inputs.map(KeyInput.fromJSON),
        });
    }

    /* The payment ID this transaction has. May be empty string. */
    public readonly paymentID: string;

    /* The inputs this transaction has */
    public readonly keyInputs: KeyInput[];

    constructor(
        keyOutputs: KeyOutput[],
        hash: string,
        transactionPublicKey: string,
        unlockTime: number,
        paymentID: string,
        keyInputs: KeyInput[]) {

        super(keyOutputs, hash, transactionPublicKey, unlockTime);

        this.paymentID = paymentID;
        this.keyInputs = keyInputs;
    }
}

/**
 *
 */
export class Transaction {

    public static fromJSON(json: TransactionJSON): Transaction {
        const transaction = Object.create(Transaction.prototype);

        return Object.assign(transaction, {
            transfers: new Map<string, number>(
                json.transfers.map((x) => [x.publicKey, x.amount] as [string, number]),
            ),

            hash: json.hash,

            fee: Number(json.fee),

            blockHeight: Number(json.blockHeight),

            timestamp: Number(json.timestamp),

            paymentID: json.paymentID,

            unlockTime: Number(json.unlockTime),

            isCoinbaseTransaction: json.isCoinbaseTransaction,
        });
    }

    /* A mapping of subwallets to amounts received in this transfer */
    public transfers: Map<string, number>;

    /* The hash of this transaction */
    public readonly hash: string;

    /* The mining fee paid on this transaction */
    public readonly fee: number;

    /* The block height this transaction is contained in */
    public readonly blockHeight: number;

    /* The timestamp of the block this transaction is contained in */
    public readonly timestamp: number;

    /* The payment ID this transaction has. May be empty string. */
    public readonly paymentID: string;

    /* When this transaction is unlocked for spending - can be interpreted as
       both a block height and a unix timestamp */
    public readonly unlockTime: number;

    /* Was this tranasction a miner reward / coinbase transaction */
    public readonly isCoinbaseTransaction: boolean;

    constructor(
        transfers: Map<string, number>,
        hash: string,
        fee: number,
        blockHeight: number,
        timestamp: number,
        paymentID: string,
        unlockTime: number,
        isCoinbaseTransaction: boolean) {

        this.transfers = transfers;
        this.hash = hash;
        this.fee = fee;
        this.blockHeight = blockHeight;
        this.timestamp = timestamp;
        this.paymentID = paymentID;
        this.unlockTime = unlockTime;
        this.isCoinbaseTransaction = isCoinbaseTransaction;
    }

    public totalAmount(): number {
        let sum: number = 0;

        for (const [publicKey, amount] of this.transfers) {
            sum += amount;
        }

        return sum;
    }

    public isFusionTransaction(): boolean {
        return this.fee === 0 && !this.isCoinbaseTransaction;
    }

    public toJSON(): TransactionJSON {
        return {
            transfers: transfersToVector(this.transfers),

            hash: this.hash,

            fee: this.fee,

            blockHeight: this.blockHeight,

            timestamp: this.timestamp,

            paymentID: this.paymentID,

            unlockTime: this.unlockTime,

            isCoinbaseTransaction: this.isCoinbaseTransaction,
        };
    }
}

/**
 * @hidden
 */
export class TransactionInput {

    public static fromJSON(json: TransactionInputJSON): TransactionInput {
        const transactionInput = Object.create(TransactionInput.prototype);

        return Object.assign(transactionInput, {
            keyImage: json.keyImage,

            amount: json.amount,

            blockHeight: json.blockHeight,

            transactionPublicKey: json.transactionPublicKey,

            transactionIndex: json.transactionIndex,

            globalOutputIndex: json.globalOutputIndex,

            key: json.key,

            spendHeight: json.spendHeight,

            unlockTime: json.unlockTime,

            parentTransactionHash: json.parentTransactionHash,
        });
    }

    /* The key image of this input */
    public readonly keyImage: string;

    /* The value of this input */
    public readonly amount: number;

    /* The height this transaction was included in. Needed for removing forked
       transactions. */
    public readonly blockHeight: number;

    /* The public key of this transaction */
    public readonly transactionPublicKey: string;

    /* The index of this input in the transaction */
    public readonly transactionIndex: number;

    /* The index of this output in the global 'DB' */
    public globalOutputIndex: number | undefined;

    /* The transaction key we took from the key outputs. NOT the same as the
       transaction public key. Confusing, I know. */
    public readonly key: string;

    /* The height this transaction was spent at. Zero if unspent. */
    public spendHeight: number;

    /* When this transaction is unlocked for spending - can be interpreted as
       both a block height and a unix timestamp */
    public readonly unlockTime: number;

    /* The transaction hash of the transaction that contains this input */
    public readonly parentTransactionHash: string;

    constructor(
        keyImage: string,
        amount: number,
        blockHeight: number,
        transactionPublicKey: string,
        transactionIndex: number,
        globalOutputIndex: number | undefined,
        key: string,
        spendHeight: number,
        unlockTime: number,
        parentTransactionHash: string) {

        this.keyImage = keyImage;
        this.amount = amount;
        this.blockHeight = blockHeight;
        this.transactionPublicKey = transactionPublicKey;
        this.transactionIndex = transactionIndex;
        this.globalOutputIndex = globalOutputIndex;
        this.key = key;
        this.spendHeight = spendHeight;
        this.unlockTime = unlockTime;
        this.parentTransactionHash = parentTransactionHash;
    }

    public toJSON(): TransactionInputJSON {
        return {
            keyImage: this.keyImage,

            amount: this.amount,

            blockHeight: this.blockHeight,

            transactionPublicKey: this.transactionPublicKey,

            transactionIndex: this.transactionIndex,

            globalOutputIndex: this.globalOutputIndex || 0,

            key: this.key,

            spendHeight: this.spendHeight,

            unlockTime: this.unlockTime,

            parentTransactionHash: this.parentTransactionHash,
        };
    }
}

/* A structure just used to display locked balance, due to change from
   sent transactions. We just need the amount and a unique identifier
   (hash+key), since we can't spend it, we don't need all the other stuff */
/**
 * @hidden
 */
export class UnconfirmedInput {

    public static fromJSON(json: UnconfirmedInputJSON): UnconfirmedInput {
        const unconfirmedInput = Object.create(UnconfirmedInput.prototype);

        return Object.assign(unconfirmedInput, {
            amount: json.amount,

            key: json.key,

            parentTransactionHash: json.parentTransactionHash,
        });
    }

    /* The amount of the number */
    public readonly amount: number;

    /* The transaction key we took from the key outputs. */
    public readonly key: string;

    /* The transaction hash of the transaction that contains this input */
    public readonly parentTransactionHash: string;

    constructor(
        amount: number,
        key: string,
        parentTransactionHash: string) {

        this.amount = amount;
        this.key = key;
        this.parentTransactionHash = parentTransactionHash;
    }

    public toJSON(): UnconfirmedInputJSON {
        return {
            amount: this.amount,

            key: this.key,

            parentTransactionHash: this.parentTransactionHash,
        };
    }
}

/**
 * @hidden
 */
export class KeyOutput {
    public static fromJSON(json: any): KeyOutput {
        const keyOutput = Object.create(KeyOutput.prototype);

        return Object.assign(keyOutput, {
            amount: json.amount,
            globalIndex: json.globalIndex,
            key: json.key,
        });
    }

    /* The output key */
    public readonly key: string;

    /* The output amount */
    public readonly amount: number;

    /* The index of the amount in the DB. The blockchain cache api returns
       this, but the regular daemon does not. */
    public readonly globalIndex?: number;

    constructor(
        key: string,
        amount: number) {

        this.key = key;
        this.amount = amount;
    }
}

/**
 * @hidden
 */
export class KeyInput {
    public static fromJSON(json: any): KeyInput {
        const keyInput = Object.create(KeyInput.prototype);

        return Object.assign(keyInput, {
            amount: json.amount,
            keyImage: json.k_image,
            outputIndexes: json.key_offsets,
        });
    }

    /* The amount of this input */
    public readonly amount: number;

    /* The key image of this input */
    public readonly keyImage: string;

    /* The output indexes of the fake and real outputs this input was created
       from, in the global 'DB' */
    public readonly outputIndexes: number[];

    constructor(
        amount: number,
        keyImage: string,
        outputIndexes: number[]) {

        this.amount = amount;
        this.keyImage = keyImage;
        this.outputIndexes = outputIndexes;
    }
}

/**
 * @hidden
 */
export class TransactionData {
    public transactionsToAdd: Transaction[] = [];

    /* Mapping of public spend key to inputs */
    public inputsToAdd: Array<[string, TransactionInput]> = [];

    /* Mapping of public spend key to key image */
    public keyImagesToMarkSpent: Array<[string, string]> = [];
}

/**
 * @hidden
 */
export class TxInputAndOwner {
    /* The input */
    public readonly input: TransactionInput;

   /* The private spend key of the input owner */
    public readonly privateSpendKey: string;

    /* The public spend key of the input owner */
    public readonly publicSpendKey: string;

    constructor(
        input: TransactionInput,
        privateSpendKey: string,
        publicSpendKey: string) {

        this.input = input;
        this.privateSpendKey = privateSpendKey;
        this.publicSpendKey = publicSpendKey;
    }
}
