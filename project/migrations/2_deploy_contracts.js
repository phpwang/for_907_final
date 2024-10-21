const DrivingTestBooking = artifacts.require("DrivingTestBooking");

module.exports = function(deployer) {
  deployer.deploy(DrivingTestBooking);
};