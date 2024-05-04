// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Donee is Ownable{

    struct Donation {
        uint256 value;
        uint256 date;
    }
    mapping(address => Donation[]) private _donations;
    uint256 public raised;
    uint256 public totalDonationCount;
    event donationReceived(address indexed donor, uint256 value);
    event Withdraw(uint256 ammount);

    string public name;
    string public description;
    string public image;
    address payable public donee_address;

    constructor(string memory _name, string memory _description, string memory _image, address payable _donee_address, address creator) Ownable(msg.sender) {
        name = _name;
        description = _description;
        image = _image;
        donee_address = _donee_address;
        _transferOwnership(creator);
    }

    function donationCount() public view returns(uint256) {
        return _donations[msg.sender].length;
    }

    function donate() public payable {
        Donation memory donation = Donation({value:msg.value, date:block.timestamp});
        _donations[msg.sender].push(donation);
        raised += msg.value;
        totalDonationCount += 1;
        emit donationReceived(msg.sender, msg.value);
    }

    function myHistory() public view returns (uint256[] memory values, uint256[] memory dates) {
        uint256 count = donationCount();
        values = new uint256[](count);
        dates = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            Donation storage donation = _donations[msg.sender][i];
            values[i] = donation.value;
            dates[i] = donation.date;
        }

        return (values, dates);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        donee_address.transfer(balance);
        emit Withdraw(balance);
    }

    function setWithdrawalAddress(address payable new_address) public onlyOwner {
        donee_address = new_address;
    }
}