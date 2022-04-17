//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

library WhiteListVerifier {
    function isAuthorized(
        address sender,
        bytes32[] memory signature,
        bytes32 merkleRoot
    ) public pure returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(sender));
        return MerkleProof.verify(signature, merkleRoot, leaf);
    }
}

contract Alchereum is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIds;
    uint private _rand = 0;
    bool public _pauseMint = false;
    bool public _pausePresale = true;
    uint256 public _presalePrice = 0.432 ether;
    uint256 public _price = 0.48 ether;
    string private baseURI = "";
    bool private _lootBoxOpened = false;
    bool private _refundable = false;
    bytes32 public _merkleRoot = "";
    string private _lootTokenURI =
        "https://ipfs.io/ipfs/QmaLr2dJ6mFLcBuJFaH48UKPwkaQpuKa3825MNn7ShuSqH";
    address public _verifier;
    mapping(address => bool) internal _ticketUsed;
    mapping(uint256 => uint256) internal _contributed;
    constructor() ERC721("Alcheneko", "ALN") {

    }

    function withdraw(uint256 amount) public onlyOwner{
        require(_tokenIds.current() >= 800, "Cannot withdraw");
        require(amount <= address(this).balance, "Insufficient Balances");
        payable(msg.sender).transfer(amount);
    }

    function refund(uint256[] memory tokens) public payable {
        require(_pauseMint == true, "minting");
        require(_refundable == true, "not refundable");
        require(_tokenIds.current() < 800, "Sold more than 800");
        uint256 total = 0;
        for (uint i = 0; i < tokens.length; i++) {
            require(ownerOf(tokens[i]) == msg.sender, "not token owner");
            total += _contributed[tokens[i]];
            _contributed[tokens[i]] = 0;
        }
        require(address(this).balance >= total, "Insufficient Balances");
        payable(msg.sender).transfer(total);
    }

    function setRefundable(bool refundable) public onlyOwner {
        _refundable = refundable;
    }

    function setPaused(bool _paused) public onlyOwner {
        _pauseMint = _paused;
    }

    function setPresalePaused(bool _paused) public onlyOwner {
        _pausePresale = _paused;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
	  baseURI = _newBaseURI;
	}

    function getMintedCount() public view returns (uint256) {
        return _tokenIds.current();
    }

    function mintNFT(address recipient, uint count) public payable {
        require(_pauseMint == false, "Mint paused");
        require(count <= 10, "Exceed mint count");
        require(msg.value >= _price * count, "Not enough ETH sent");
        for (uint i = 0; i < count; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            require(newItemId > 0 && newItemId < 3000, "Exceeds token supply");
            _contributed[newItemId] = 0.48 ether;
            _mint(recipient, newItemId);
            _setTokenURI(newItemId, _lootTokenURI);
        }
    }

    function setWhitelistVerifier(address verifier) public onlyOwner {
        _verifier = verifier;
    }

    function setMerkleRoot(bytes32 root) public onlyOwner {
        _merkleRoot = root;
    }

    function presale(
        address recipient,
        bytes32[] memory _signature
    ) public payable returns (uint256) {
        require(_pausePresale == false, "Mint paused");
        require(!_ticketUsed[msg.sender], "ticket used");
        require(
            WhiteListVerifier.isAuthorized(
                msg.sender,
                _signature,
                _merkleRoot
            ),
            "invalid ticket"
        );
    
        require(msg.value >= _presalePrice, "Not enough ETH sent"); 
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        require(newItemId > 0 && newItemId < 5000, "Exceeds token supply");
        _ticketUsed[msg.sender] = true;
        _contributed[newItemId] = 0.432 ether;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, _lootTokenURI);
        
        return newItemId;
    }

    function _isLootBoxOpened() internal view returns (bool) {
        return _lootBoxOpened;
    }

    function setLootBoxOpened(bool _status) public onlyOwner {
        _lootBoxOpened = _status;
    }

    function setTokenRandom(bytes32 _hash) public onlyOwner {
        _rand = uint(_hash);
    }

    function setlootTokenURI(string memory uri) public onlyOwner {
        _lootTokenURI = uri;
    }

    // this function controls how the token URI is constructed
    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "Non-exist token"
        );
        if (_lootBoxOpened) {
            string memory __baseURI = _baseURI();
            return
                bytes(baseURI).length > 0
                    ? string(
                        abi.encodePacked(__baseURI, ((tokenId + _rand)%4000).toString(), ".json")
                    )
                    : "";
        } else {
            return _lootTokenURI;
        }
    }

    function contractURI() public pure returns (string memory) {
        return "ipfs://Qmbxdqrj7JYZLLie61QzgMYPBBQ46qG8aJmNjgSZaqJM6R";
    }
}
