import { BookingClient } from '../clients/BookingClient';

const mockRequest = {
  get:    jest.fn(),
  post:   jest.fn(),
  put:    jest.fn(),
  patch:  jest.fn(),
  delete: jest.fn()
};

jest.mock('../clients/AuthHelper', () => ({
  AuthHelper: jest.fn().mockImplementation(() => ({
    getToken: jest.fn().mockResolvedValue('mock-token-abc123')
  }))
}));

describe('BookingClient — Unit Tests with Mocks', () => {

  let client: BookingClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new BookingClient(mockRequest as any);
  });

  test('ping calls GET /ping', async () => {
    mockRequest.get.mockResolvedValue({ status: () => 201 });
    await client.ping();
    expect(mockRequest.get).toHaveBeenCalledWith('/ping');
  });

  test('createBooking calls POST /booking with payload', async () => {
    const payload = {
      firstname: 'Test', lastname: 'User',
      totalprice: 100, depositpaid: true,
      bookingdates: { checkin: '2025-06-01', checkout: '2025-06-10' }
    };
    mockRequest.post.mockResolvedValue({ status: () => 200 });
    await client.createBooking(payload);
    expect(mockRequest.post).toHaveBeenCalledWith('/booking', { data: payload });
  });

  test('getBooking calls GET /booking/123', async () => {
    mockRequest.get.mockResolvedValue({ status: () => 200 });
    await client.getBooking(123);
    expect(mockRequest.get).toHaveBeenCalledWith('/booking/123');
  });

  test('getAllBookings calls GET /booking', async () => {
    mockRequest.get.mockResolvedValue({ status: () => 200 });
    await client.getAllBookings();
    expect(mockRequest.get).toHaveBeenCalledWith('/booking');
  });

  test('updateBooking calls PUT with token cookie header', async () => {
    const payload = {
      firstname: 'Updated', lastname: 'User',
      totalprice: 999, depositpaid: false,
      bookingdates: { checkin: '2025-07-01', checkout: '2025-07-05' }
    };
    mockRequest.put.mockResolvedValue({ status: () => 200 });
    await client.updateBooking(123, payload);
    expect(mockRequest.put).toHaveBeenCalledWith('/booking/123', {
      data:    payload,
      headers: { Cookie: 'token=mock-token-abc123' }
    });
  });

  test('partialUpdateBooking calls PATCH with token cookie header', async () => {
    const fields = { firstname: 'Patched', totalprice: 111 };
    mockRequest.patch.mockResolvedValue({ status: () => 200 });
    await client.partialUpdateBooking(123, fields);
    expect(mockRequest.patch).toHaveBeenCalledWith('/booking/123', {
      data:    fields,
      headers: { Cookie: 'token=mock-token-abc123' }
    });
  });

  test('deleteBooking calls DELETE with token cookie header', async () => {
    mockRequest.delete.mockResolvedValue({ status: () => 201 });
    await client.deleteBooking(123);
    expect(mockRequest.delete).toHaveBeenCalledWith('/booking/123', {
      headers: { Cookie: 'token=mock-token-abc123' }
    });
  });

  test('getBooking with non-existent ID calls correct endpoint', async () => {
    mockRequest.get.mockResolvedValue({ status: () => 404 });
    await client.getBooking(999999999);
    expect(mockRequest.get).toHaveBeenCalledWith('/booking/999999999');
  });

});