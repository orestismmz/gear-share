import { createClient } from "@/app/lib/supabase/server";

// Mock the Supabase client creation
jest.mock("@/app/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

import { searchListings } from "../listings";

describe("searchListings", () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock Supabase client with chainable methods
    mockSupabaseClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    };

    // Mock createClient to return our mock client
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
  });

  it("should return all listings when search query is empty", async () => {
    const mockListings = [
      { id: "1", title: "Camera", price_per_day: 100 },
      { id: "2", title: "Laptop", price_per_day: 200 },
    ];

    // Mock getAllListings by mocking its Supabase query
    // When searchListings calls getAllListings, it will use createClient
    // We'll mock the second call (for getAllListings) to return all listings
    let callCount = 0;
    (createClient as jest.Mock).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        // First call is from searchListings checking if query is empty
        // Second call would be from getAllListings
        return mockSupabaseClient;
      }
      // Second call - this is from getAllListings
      const getAllListingsClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockListings,
          error: null,
        }),
      };
      return getAllListingsClient;
    });

    const result = await searchListings("");

    // Verify that the search-specific query chain was not called
    expect(mockSupabaseClient.ilike).not.toHaveBeenCalled();
    // Result should be an array (from getAllListings)
    expect(Array.isArray(result)).toBe(true);
  });

  it("should return all listings when search query is only whitespace", async () => {
    const mockListings = [{ id: "1", title: "Camera", price_per_day: 100 }];

    // Similar approach - mock getAllListings behavior
    let callCount = 0;
    (createClient as jest.Mock).mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return mockSupabaseClient;
      }
      const getAllListingsClient = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockListings,
          error: null,
        }),
      };
      return getAllListingsClient;
    });

    const result = await searchListings("   ");

    // Verify that the search-specific query chain was not called
    expect(mockSupabaseClient.ilike).not.toHaveBeenCalled();
    // Result should be an array
    expect(Array.isArray(result)).toBe(true);
  });

  it("should search listings by title when query is provided", async () => {
    const mockSearchResults = [
      { id: "1", title: "Professional Camera", price_per_day: 100 },
      { id: "3", title: "Camera Lens", price_per_day: 50 },
    ];

    // Mock the chain of Supabase query methods
    mockSupabaseClient.order.mockResolvedValue({
      data: mockSearchResults,
      error: null,
    });

    const result = await searchListings("camera");

    expect(createClient).toHaveBeenCalled();
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("listings");
    expect(mockSupabaseClient.select).toHaveBeenCalledWith("*");
    expect(mockSupabaseClient.ilike).toHaveBeenCalledWith("title", "%camera%");
    expect(mockSupabaseClient.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(result).toEqual(mockSearchResults);
  });

  it("should trim whitespace from search query", async () => {
    const mockSearchResults = [
      { id: "1", title: "Camera", price_per_day: 100 },
    ];

    mockSupabaseClient.order.mockResolvedValue({
      data: mockSearchResults,
      error: null,
    });

    await searchListings("  camera  ");

    // Verify that ilike was called with trimmed query
    expect(mockSupabaseClient.ilike).toHaveBeenCalledWith("title", "%camera%");
  });

  it("should return empty array when Supabase returns an error", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    mockSupabaseClient.order.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const result = await searchListings("camera");

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error searching listings:", {
      message: "Database error",
    });

    consoleErrorSpy.mockRestore();
  });

  it("should return empty array when data is null", async () => {
    mockSupabaseClient.order.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await searchListings("camera");

    expect(result).toEqual([]);
  });

  it("should handle case-insensitive search", async () => {
    const mockSearchResults = [
      { id: "1", title: "CAMERA", price_per_day: 100 },
    ];

    mockSupabaseClient.order.mockResolvedValue({
      data: mockSearchResults,
      error: null,
    });

    const result = await searchListings("CaMeRa");

    expect(mockSupabaseClient.ilike).toHaveBeenCalledWith("title", "%CaMeRa%");
    expect(result).toEqual(mockSearchResults);
  });
});
