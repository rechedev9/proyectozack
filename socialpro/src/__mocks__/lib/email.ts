export const resend = {
  emails: { send: jest.fn().mockResolvedValue({ id: 'mock-id' }) },
};

export const sendContactEmail = jest.fn().mockResolvedValue(undefined);
