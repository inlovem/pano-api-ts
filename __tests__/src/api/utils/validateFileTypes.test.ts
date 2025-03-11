import { validateFileType } from '../../../../src/api/utils/validateFileType'
import { FastifyReply, FastifyRequest } from 'fastify';

// Mock data
const mockJpegFile = {
  filename: 'test.jpg',
  mimetype: 'image/jpeg',
  fieldname: 'file',
  encoding: '7bit',
  file: Buffer.from('mock jpeg content')
};

const mockPngFile = {
  filename: 'test.png',
  mimetype: 'image/png',
  fieldname: 'file',
  encoding: '7bit',
  file: Buffer.from('mock png content')
};

const mockPdfFile = {
  filename: 'test.pdf',
  mimetype: 'application/pdf',
  fieldname: 'file',
  encoding: '7bit',
  file: Buffer.from('mock pdf content')
};


describe('validateFileType', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  
  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      fileData: undefined
    };
    
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });
  
  test('should accept a valid JPEG file', async () => {
    // Arrange
    mockRequest.file = jest.fn().mockResolvedValue(mockJpegFile);
    
    // Act
    await validateFileType(mockRequest as FastifyRequest, mockReply as FastifyReply);
    
    // Assert
    expect(mockRequest.file).toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
    expect(mockRequest.fileData).toEqual(mockJpegFile);
  });
  
  test('should accept a valid PNG file', async () => {
    // Arrange
    mockRequest.file = jest.fn().mockResolvedValue(mockPngFile);
    
    // Act
    await validateFileType(mockRequest as FastifyRequest, mockReply as FastifyReply);
    
    // Assert
    expect(mockRequest.file).toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
    expect(mockRequest.fileData).toEqual(mockPngFile);
  });
  
  test('should reject a PDF file with 400 status', async () => {
    // Arrange
    mockRequest.file = jest.fn().mockResolvedValue(mockPdfFile);
    
    // Act
    await validateFileType(mockRequest as FastifyRequest, mockReply as FastifyReply);
    
    // Assert
    expect(mockRequest.file).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Invalid file type. Only JPEG and PNG are allowed.'
    });
    expect(mockRequest.fileData).toBeUndefined();
  });
  
  test('should reject when no file is provided with 400 status', async () => {
    // Arrange
    mockRequest.file = jest.fn().mockResolvedValue(null);
    
    // Act
    await validateFileType(mockRequest as FastifyRequest, mockReply as FastifyReply);
    
    // Assert
    expect(mockRequest.file).toHaveBeenCalled();
    expect(mockReply.status).toHaveBeenCalledWith(400);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'File is required.'
    });
    expect(mockRequest.fileData).toBeUndefined();
  });
  
  test('should handle file function throwing an error', async () => {
    // Arrange
    const fileError = new Error('File upload error');
    mockRequest.file = jest.fn().mockRejectedValue(fileError);
    
    // Act & Assert
    await expect(validateFileType(mockRequest as FastifyRequest, mockReply as FastifyReply))
      .rejects.toThrow('File upload error');
  });
});