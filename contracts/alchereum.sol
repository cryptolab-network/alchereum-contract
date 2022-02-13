//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./ksm.sol";

contract Alchereum is ERC721URIStorage, Ownable, PaymentSplitter, KSM {
    using ECDSA for bytes32;
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIds;
    bool public pauseMint = false;
    bool public pausePresale = false;
    uint256 private price = 0.08 ether;
    uint256 private presalePrice = 0.07 ether;
    string private baseURI = "";
    bool private _lootBoxOpened = false;
    string private _lootTokenURI =
        "ipfs://QmdxotKEKuELKmVQSB4fx16bt9tGPQcxamcAUQtjySnqrv"; // TODO: must be changed to the real lootbox
    mapping(address => bool) internal _ticketUsed;

    constructor(address[] memory _payees, uint256[] memory _shares) ERC721("Alchereum", "ALE") PaymentSplitter(_payees, _shares) payable {
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        ERC721.transferFrom(from, to, tokenId);
        deleteKsmAddress();
    }

    function setPaused(bool _paused) public onlyOwner {
        pauseMint = _paused;
    }

    function setPresalePaused(bool _paused) public onlyOwner {
        pausePresale = _paused;
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
        require(pauseMint == false, "Mint paused");
        require(count <= 10, "Exceed mint count");
        require(msg.value >= price * count, "Not enough ETH sent"); 
        for (uint i = 0; i < count; i++) {
            _tokenIds.increment();
            uint256 newItemId = _tokenIds.current();
            require(newItemId > 0 && newItemId < 5000, "Exceeds token supply");
            _mint(recipient, newItemId);
            _setTokenURI(newItemId, _lootTokenURI);
        }
    }

    // function mintPrivate(address recipient) public payable onlyOwner
    //     returns (uint256)
    // {
    //     _tokenIds.increment();
    //     uint256 newItemId = _tokenIds.current();
    //     require(newItemId > 0 && newItemId < 5000, "Exceeds token supply");
    //     _mint(recipient, newItemId);
    //     _setTokenURI(newItemId, _lootTokenURI);

    //     return newItemId;
    // }

    function isAuthorized(
        address contractAddress,
        address sender,
        bytes memory signature,
        address _signerAddress
    ) private pure returns (bool) {
        bytes32 message = keccak256(abi.encodePacked(contractAddress, sender));
        address recoveredAddress = ECDSA.recover(message.toEthSignedMessageHash(), signature);
        return _signerAddress == recoveredAddress;
    }

    function presale(
        address recipient,
        bytes memory _signature
    ) public payable returns (uint256) {
        require(pausePresale == false, "Mint paused");
        require(!_ticketUsed[recipient], "ticket used");
        require(
            isAuthorized(
                address(this),
                msg.sender,
                _signature,
                owner()
            ),
            "invalid ticket"
        );
    
        require(msg.value >= price, "Not enough ETH sent"); 
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        require(newItemId > 0 && newItemId < 5000, "Exceeds token supply");
        _ticketUsed[msg.sender] = true;
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
                        abi.encodePacked(__baseURI, tokenId.toString(), ".json")
                    )
                    : "";
        } else {
            return _lootTokenURI;
        }
    }

    function contractURI() public pure returns (string memory) {
        return "ipfs://QmUk2v1eN3kGdCnBtiWH22zYsNGn7NBPeiTeGibgumxzee";
    }
}
