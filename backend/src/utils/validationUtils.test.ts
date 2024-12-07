import { handleValidationError } from './validationUtils';
import { Response } from 'express';

describe('handleValidationError', () => {
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
    };
  });

  it('Deve definir o status como 400 e retornar a mensagem de erro', () => {
    const message = 'Erro de validação';
    handleValidationError(mockResponse as Response, message);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ message });
  });
});
