import { expect } from 'chai';
import { Response } from 'express';
import { handleValidationError } from './validationUtils';

describe('handleValidationError', () => {
  it('deve retornar status 400 com a mensagem de erro', () => {
    // Mock do objeto Response
    const res: Partial<Response> = {
      status: function (code: number): Response {
        expect(code).to.equal(400); // Valida o status
        return this as Response; // Retorna o mock como Response
      },
      json: function (data: { message: string }): Response {
        expect(data).to.deep.equal({ message: 'Erro de validação' }); // Valida o JSON retornado
        return this as Response; // Retorna o mock como Response
      },
    };

    // Chama a função com o mock criado
    handleValidationError(res as Response, 'Erro de validação');
  });
});
