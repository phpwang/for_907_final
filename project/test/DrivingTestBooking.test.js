const DrivingTestBooking = artifacts.require("DrivingTestBooking");
const truffleAssert = require('truffle-assertions');

contract("DrivingTestBooking", accounts => {
  let drivingTestBooking;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    drivingTestBooking = await DrivingTestBooking.new();
  });

  // ... (previous tests remain the same)

  describe("Booking Cancellation", () => {
    let bookingId;

    beforeEach(async () => {
      await drivingTestBooking.registerUser({ from: user1 });
      const testDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      const result = await drivingTestBooking.createBooking(testDate, "Auckland", "Test Center 1", { from: user1 });
      bookingId = result.logs[0].args.bookingId.toNumber();
    });

    it("should allow the booking owner to cancel their booking", async () => {
      const result = await drivingTestBooking.cancelBooking(bookingId, { from: user1 });
      truffleAssert.eventEmitted(result, 'BookingCancelled', (ev) => {
        return ev.bookingId.toNumber() === bookingId;
      });
    });

    it("should not allow non-owners to cancel a booking", async () => {
      await drivingTestBooking.registerUser({ from: user2 });  // Register user2
      await truffleAssert.reverts(
        drivingTestBooking.cancelBooking(bookingId, { from: user2 }),
        "Only the booking owner can cancel"
      );
    });
  });

  // ... (rest of the tests remain the same)
});