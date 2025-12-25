// Set environment variables for testing
process.env.NODE_ENV = "development";
process.env.FRONTEND_URL = "http://localhost:5173";

const {
  forgotPassword,
  resetPassword,
  testEmail,
} = require("../controllers/authController");
const sendEmail = require("../utils/sendEmail");

// Mock the sendEmail utility
jest.mock("../utils/sendEmail");

// Mock the database models
jest.mock("../models/userModel");
jest.mock("../models/passwordResetModel");

const User = require("../models/userModel");
const PasswordReset = require("../models/passwordResetModel");

describe("Auth Controller Tests", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("forgotPassword", () => {
    test("should send reset email for existing user", async () => {
      // Mock User.findOne to return a user
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
      };
      User.findOne.mockResolvedValue(mockUser);

      // Mock PasswordReset.create to resolve
      PasswordReset.create.mockResolvedValue({
        userId: "user123",
        token: "hashedtoken",
        expiresAt: new Date(Date.now() + 3600000),
        used: false,
      });

      // Mock request and response
      const req = {
        body: { email: "test@example.com" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock sendEmail to resolve
      sendEmail.mockResolvedValue();

      // Call forgotPassword
      await forgotPassword(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "If that email exists, a reset link has been sent",
        resetToken: expect.any(String), // Should include token in development
      });

      // Check that sendEmail was called
      expect(sendEmail).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Password Reset Request - CACPM",
        html: expect.stringContaining("Reset Password"),
      });

      // Check that PasswordReset.create was called
      expect(PasswordReset.create).toHaveBeenCalled();
    });

    test("should not reveal if email does not exist", async () => {
      // Mock User.findOne to return null (user not found)
      User.findOne.mockResolvedValue(null);

      const req = {
        body: { email: "nonexistent@example.com" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "If that email exists, a reset link has been sent",
        resetToken: undefined, // Should be undefined for non-existing users
      });

      // sendEmail should not be called
      expect(sendEmail).not.toHaveBeenCalled();
    });

    test("should return error for missing email", async () => {
      const req = {
        body: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email is required",
      });
    });
  });

  describe("resetPassword", () => {
    test("should reset password with valid token", async () => {
      // Mock User.findById to return a user with comparePassword method
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "hashedpassword",
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(this),
      };
      User.findById.mockResolvedValue(mockUser);

      // Mock PasswordReset.findOne to return a valid reset record
      const mockResetRecord = {
        _id: "reset123",
        userId: "user123",
        token: "hashedtoken",
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        used: false,
        save: jest.fn().mockResolvedValue(this),
      };
      PasswordReset.findOne.mockResolvedValue(mockResetRecord);

      const req = {
        body: { token: "rawtoken", newPassword: "newpassword123" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password reset successful",
      });

      // Check that user was saved (password updated)
      expect(mockUser.save).toHaveBeenCalled();

      // Check that reset token was marked as used and saved
      expect(mockResetRecord.used).toBe(true);
      expect(mockResetRecord.save).toHaveBeenCalled();
    });

    test("should reject invalid token", async () => {
      // Mock PasswordReset.findOne to return null (invalid token)
      PasswordReset.findOne.mockResolvedValue(null);

      const req = {
        body: { token: "invalidtoken", newPassword: "newpassword123" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or expired reset token",
      });
    });

    test("should reject expired token", async () => {
      // Mock PasswordReset.findOne to return null (expired token not found)
      PasswordReset.findOne.mockResolvedValue(null);

      const req = {
        body: { token: "expiredtoken", newPassword: "newpassword123" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or expired reset token",
      });
    });

    test("should reject password shorter than 8 characters", async () => {
      const req = {
        body: { token: "sometoken", newPassword: "short" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password must be at least 8 characters",
      });
    });
  });

  describe("testEmail", () => {
    test("should send test email successfully", async () => {
      const req = {
        body: { to: "test@example.com" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock sendEmail to resolve
      sendEmail.mockResolvedValue();

      await testEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Test email sent successfully",
      });

      expect(sendEmail).toHaveBeenCalledWith({
        to: "test@example.com",
        subject: "Test Email - CACPM",
        html: expect.stringContaining("Test Email - CACPM"),
      });
    });

    test("should return error for missing recipient", async () => {
      const req = {
        body: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await testEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Recipient email is required",
      });
    });

    test("should handle email sending failure", async () => {
      const req = {
        body: { to: "test@example.com" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock sendEmail to reject
      sendEmail.mockRejectedValue(new Error("SMTP connection failed"));

      await testEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to send test email",
        error: "SMTP connection failed",
      });
    });
  });
});
