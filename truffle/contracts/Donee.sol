// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract Donee is Ownable {

    struct Donation {
        uint256 value;
        uint256 date;
    }
    mapping(address => Donation[]) private _donations;
    uint256 public raised;
    uint256 public totalDonationCount;
    event donationReceived(address indexed donor, uint256 value);
    event Withdraw(uint256 amount);

    string public name;
    string public description;
    string public ipfsImageHash;
    address payable private donee_address;

    AggregatorV3Interface internal priceFeed;
    uint private lastCalled = 0;

    modifier rateLimit(uint _time) {
        require(block.timestamp > lastCalled + _time, "Rate limit exceeded.");
        lastCalled = block.timestamp;
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        string memory _image,
        address payable _donee_address,
        address creator,
        address _priceFeedAddress
    ) Ownable(msg.sender) {
        name = _name;
        description = _description;
        ipfsImageHash = _image;
        donee_address = _donee_address;
        _transferOwnership(creator);
        priceFeed = AggregatorV3Interface(_priceFeedAddress);
    }

    function donationCount() private view returns (uint256) {
        return _donations[msg.sender].length;
    }

    function donate() external payable {
        Donation memory donation = Donation({ value: msg.value, date: block.timestamp });
        _donations[msg.sender].push(donation);
        raised += msg.value;
        totalDonationCount += 1;
        emit donationReceived(msg.sender, msg.value);
    }

    function myHistory() external view returns (uint256[] memory values, uint256[] memory dates) {
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

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        donee_address.transfer(balance);
        emit Withdraw(balance);
    }

    function setWithdrawalAddress(address payable new_address) external onlyOwner rateLimit(60) {
        donee_address = new_address;
    }

    function getLatestPrice() public view returns (int) {
        (
            /* uint80 roundID */,
            int price,
            /* uint startedAt */,
            /* uint timeStamp */,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();
        return price;
    }

    function raisedInUSD() public view returns (uint256) {
        int ethPrice = getLatestPrice();
        require(ethPrice > 0, "Invalid price data");
        return (raised * uint256(ethPrice)) / 1e8; // Adjust for Chainlink's price precision (8 decimals)
    }
}
