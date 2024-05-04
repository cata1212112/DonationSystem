// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Donee.sol";

contract DoneeFactory {
    Donee[] private _donees;
    event DoneeCreated(Donee indexed donee, address indexed creator);
    function doneesCnt() public view returns(uint256) {
        return _donees.length;
    }

    function createDonee(string memory name, string memory description, string memory image, address payable withdrawalAddress) public {
        Donee donee = new Donee(name, description, image, withdrawalAddress, msg.sender);
        _donees.push(donee);
        emit DoneeCreated(donee, msg.sender);
    }

    function allDonees() public view returns(Donee[] memory donees) {
        return _donees;
    }
}