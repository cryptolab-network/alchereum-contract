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

contract Alcheneko is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIds;
    uint private _rand = 0;
    bool public _pauseMint = true;
    bool public _pausePresale = true;
    uint256 public _presalePrice = 0.432 ether;
    uint256 public _price = 0.48 ether;
    string private baseURI = "";
    bool private _lootBoxOpened = false;
    bytes32 public _merkleRoot = "";
    string private _lootTokenURI =
        "https://gateway.pinata.cloud/ipfs/QmNx9fqjhn9oHX7TskctPfUZov69sVXv8m88uDcy49NzEG";
    address public _verifier;
    mapping(address => bool) internal _ticketUsed;
    mapping(uint256 => uint256) internal _contributed;

    uint256 public _refundStartBlock;
    uint public _refundThreshold = 800;
    uint public _supply = 4000;

    constructor() ERC721("Alcheneko", "ALN") {

    }

    function withdraw(uint256 amount) public onlyOwner{
        require(_tokenIds.current() >= _refundThreshold, "Cannot withdraw");
        require(amount <= address(this).balance, "Insufficient Balances");
        payable(msg.sender).transfer(amount);
    }

    function refund(uint256[] memory tokens) public payable {
        require(_pauseMint == true, "minting");
        require(_pausePresale == true, "minting");
        // require(_refundable == true, "not refundable");
        require(block.number >= _refundStartBlock, "not yet refundable");
        require(_tokenIds.current() < _refundThreshold, "Sold more than 800");
        uint256 total = 0;
        for (uint i = 0; i < tokens.length; i++) {
            require(ownerOf(tokens[i]) == msg.sender, "not token owner");
            require(_contributed[tokens[i]] > 0, "already withdrew");
            total += _contributed[tokens[i]];
            _contributed[tokens[i]] = 0;
        }
        require(address(this).balance >= total, "Insufficient Balances");
        payable(msg.sender).transfer(total);
    }

    function setPaused(bool _paused) public onlyOwner {
        _pauseMint = _paused;
        if (_refundStartBlock == 0) {
            _refundStartBlock = block.number + 200000;
        }
    }

    function setPresalePaused(bool _paused) public onlyOwner {
        _pausePresale = _paused;
        if (_refundStartBlock == 0) {
            _refundStartBlock = block.number + 200000;
        }
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
            require(newItemId > 0 && newItemId <= _supply, "Exceeds token supply");
            _contributed[newItemId] = _price;
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
        require(newItemId > 0 && newItemId <= _supply, "Exceeds token supply");
        _ticketUsed[msg.sender] = true;
        _contributed[newItemId] = _presalePrice;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, _lootTokenURI);
        
        return newItemId;
    }

    function _isLootBoxOpened() internal view returns (bool) {
        return _lootBoxOpened;
    }

    function setLootBoxOpened(bool _status) public onlyOwner {
        require(_rand != 0, "rand a number first");
        _lootBoxOpened = _status;
    }

    function setTokenRandom(bytes32 _hash) public onlyOwner {
        require(_rand == 0, "only once");
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
                        abi.encodePacked(__baseURI, ((tokenId + _rand)%_supply).toString(), ".json")
                    )
                    : "";
        } else {
            return _lootTokenURI;
        }
    }

    function contractURI() public pure returns (string memory) {
        return "ipfs://QmPvhGd5R1DbEjZbcVhBkRJtCzyFGUqEedSC6ZcBcRkJ3B";
    }
}
