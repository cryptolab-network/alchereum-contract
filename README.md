# Alchereum Contract

## Prereq

You have to get your own Pinata Secret and Web3 API key first.

## Build

`npx hardhat compile`

## Deploy

`node script/deploy.js`

## Test

Modify the parameters in `.env`
```
ETH_PRIVATE_KEY=[Your ETH Private Key]
ETH_PUBLIC_KEY=[Your ETH Public Address]
API_URL=[Your Web3 API url such as Alchemy]
PINATA_SECRET=[Your Pinata secret]
PINATA_KEY=[Your Pinata key]
CONTRACT_ADDRESS=[The contract address deployed on the network]
```

### Mint

`node script/mint.js`

### Presale

Get the signature from `http://3.128.178.44:3030/api/sign` with body
```json
{
  "sender": "Your ETH address"
}
```

* Ask Tanis to add your address to the whitelist first

If succeed, you would see response like 

```json
{
    "message": "0x58a2b568ba60b9eb43b9a0d69ff6b799de8e665f693b36737a1de9f0d92967b6",
    "messageHash": "0x44164ad3820fcef80a7b55d64de7f3c87cec1ca729a582c664a11cd15efb6778",
    "v": "0x1b",
    "r": "0x78aa4ed45ae2eca902324346c10193492406d388b82c113f2ebd31c3fe464c52",
    "s": "0x4ed30595fc89afd3fbbe5679219cc12381129681595532cbfbfe1d70aafae003",
    "signature": "0x78aa4ed45ae2eca902324346c10193492406d388b82c113f2ebd31c3fe464c524ed30595fc89afd3fbbe5679219cc12381129681595532cbfbfe1d70aafae0031b"
}
```

copy the `signature` to `script/presale.js`

```
data: nftContract.methods.presale(PUBLIC_KEY,
      "0x78aa4ed45ae2eca902324346c10193492406d388b82c113f2ebd31c3fe464c524ed30595fc89afd3fbbe5679219cc12381129681595532cbfbfe1d70aafae0031b").encodeABI(),
```
and run `node script/presale.js`