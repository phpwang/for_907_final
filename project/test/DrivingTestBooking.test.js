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

  describe("User Registration", () => {
    it("should allow a user to register", async () => {
      await drivingTestBooking.registerUser({ from: user1 });
      const isRegistered = await drivingTestBooking.registeredUsers(user1);
      assert.equal(isRegistered, true, "User should be registered");
    });

    it("should not allow a user to register twice", async () => {
      await drivingTestBooking.registerUser({ from: user1 });
      await truffleAssert.reverts(
        drivingTestBooking.registerUser({ from: user1 }),
        "User is already registered"
      );
    });
  });

  describe("Booking Creation", () => {
    beforeEach(async () => {
      await drivingTestBooking.registerUser({ from: user1 });
    });

    it("should allow a registered user to create a booking", async () => {
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      await drivingTestBooking.createBooking(futureDate, "Auckland", "Test Center 1", { from: user1 });
      const bookingId = await drivingTestBooking.nextBookingId() - 1;
      const booking = await drivingTestBooking.getBooking(bookingId);
      assert.equal(booking[0], user1, "Booking should be created for the correct user");
      assert.equal(booking[2], "Auckland", "Location should match");
      assert.equal(booking[3], "Test Center 1", "Venue should match");
      assert.equal(booking[4], true, "Booking should be active");
    });

    it("should not allow booking creation for past dates", async () => {
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
      await truffleAssert.reverts(
        drivingTestBooking.createBooking(pastDate, "Auckland", "Test Center 1", { from: user1 }),
        "Test date must be in the future"
      );
    });
  });

  describe("Waitlist", () => {
    beforeEach(async () => {
      await drivingTestBooking.registerUser({ from: user1 });
      await drivingTestBooking.registerUser({ from: user2 });
    });

    it("should allow a user to join the waitlist", async () => {
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      await drivingTestBooking.joinWaitlist(futureDate, "Auckland", "Test Center 1", { from: user1 });
      const waitlistLength = await drivingTestBooking.getWaitlistLength(futureDate);
      assert.equal(waitlistLength.toNumber(), 1, "Waitlist should have one entry");
    });

    it("should return correct user waitlist entries", async () => {
      const futureDate1 = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      const futureDate2 = Math.floor(Date.now() / 1000) + 172800; // 2 days from now
      await drivingTestBooking.joinWaitlist(futureDate1, "Auckland", "Test Center 1", { from: user1 });
      await drivingTestBooking.joinWaitlist(futureDate2, "Wellington", "Test Center 2", { from: user1 });

      const userEntries = await drivingTestBooking.getUserWaitlistEntries(user1);
      assert.equal(userEntries.length, 2, "User should have two waitlist entries");
      assert.equal(userEntries[0].preferredLocation, "Auckland", "First entry location should match");
      assert.equal(userEntries[1].preferredLocation, "Wellington", "Second entry location should match");
    });
  });

  describe("Booking Cancellation and Waitlist Movement", () => {
    beforeEach(async () => {
      await drivingTestBooking.registerUser({ from: user1 });
      await drivingTestBooking.registerUser({ from: user2 });
    });

    it("should cancel booking and move waitlist entry", async () => {
      const futureDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      await drivingTestBooking.createBooking(futureDate, "Auckland", "Test Center 1", { from: user1 });
      await drivingTestBooking.joinWaitlist(futureDate, "Auckland", "Test Center 1", { from: user2 });

      const bookingId = (await drivingTestBooking.nextBookingId()).toNumber() - 1;
      await drivingTestBooking.cancelBooking(bookingId, { from: user1 });

      const updatedBooking = await drivingTestBooking.getBooking(bookingId);
      assert.equal(updatedBooking[0], user2, "Booking should be reassigned to waitlist user");
      assert.equal(updatedBooking[4], true, "Booking should be active");

      const waitlistLength = await drivingTestBooking.getWaitlistLength(futureDate);
      assert.equal(waitlistLength.toNumber(), 0, "Waitlist should be empty after reassignment");
    });
  });
});