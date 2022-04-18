//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./alcheneko.sol";

contract AltStorage is Ownable {
    mapping(address => string) internal _altAddress; // owner's ksm address
    Alcheneko _alchereum;
    constructor() {
    }

    function setAddress(string memory ksmAddress, uint256 tokenId) public {
        require(_alchereum.ownerOf(tokenId) == address(msg.sender), "Not your NFT");
        _altAddress[msg.sender] = ksmAddress;
    }

    function getAddress() public view returns (string memory){
        return _altAddress[msg.sender];
    }

    function getAddressByTokenId(uint256 tokenId) public view returns (string memory){
        return _altAddress[_alchereum.ownerOf(tokenId)];
    }

    function deleteAddress() public {
        delete _altAddress[msg.sender];
    }

    function setAlchereumContract(Alcheneko alc) public onlyOwner {
        _alchereum = alc;
    }
}