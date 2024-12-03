import { expect } from 'chai';
import { Response } from 'express';
import { handleValidationError } from './validationUtils';

describe('handleValidationError', () => {
  it('deve retornar status 400 com a mensagem de erro', () => {
    // Mock do objeto Response
    const res = {
      status: function (code: number) {
        expect(code).to.equal(400);
        return this;
      },
      json: function (data: any) {
        expect(data).to.deep.equal({ message: 'Erro de validação' });
      },
    } as unknown as Response;

    handleValidationError(res, 'Erro de validação');
  });
});
