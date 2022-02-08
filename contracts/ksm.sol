//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

abstract contract KSM is ERC721URIStorage{
    mapping(address => string) internal _ksmAddress; // owner's ksm address

    constructor() {
    }

    function setKsmAddress(string memory ksmAddress, uint256 tokenId) public {
        address tokenOwner = getApproved(tokenId);
        require(tokenOwner == msg.sender, "Not your NFT");
        _ksmAddress[msg.sender] = ksmAddress;
    }

    function getKsmAddress() public view returns (string memory){
        return _ksmAddress[msg.sender];
    }

    function getKsmAddressByTokenId(uint256 tokenId) public view returns (string memory){
        address tokenOwner = getApproved(tokenId);
        return _ksmAddress[tokenOwner];
    }

    function deleteKsmAddress() internal {
        delete _ksmAddress[msg.sender];
    }
}