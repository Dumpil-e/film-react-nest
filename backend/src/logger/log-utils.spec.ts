import { serializeValue } from './log-utils';

describe('serializeValue', () => {
  describe('базовая сериализация (treatNullAsEmpty = false)', () => {
    it('должен возвращать строку как есть', () => {
      expect(serializeValue('hello')).toBe('hello');
    });

    it('должен извлекать message из Error', () => {
      const error = new Error('test error');
      expect(serializeValue(error)).toBe('test error');
    });

    it('должен сериализовать объекты в JSON', () => {
      const obj = { key: 'value' };
      expect(serializeValue(obj)).toBe('{"key":"value"}');
    });

    it('должен обрабатывать circular references', () => {
      const obj: any = {};
      obj.self = obj;
      expect(() => serializeValue(obj)).not.toThrow();
    });

    it('должен конвертировать null в строку "null"', () => {
      expect(serializeValue(null)).toBe('null');
    });

    it('должен конвертировать undefined в строку "undefined"', () => {
      expect(serializeValue(undefined)).toBe('undefined');
    });

    it('должен конвертировать числа в строки', () => {
      expect(serializeValue(123)).toBe('123');
    });

    it('должен конвертировать булевы в строки', () => {
      expect(serializeValue(true)).toBe('true');
    });
  });

  describe('сериализация для TSKV (treatNullAsEmpty = true)', () => {
    it('должен возвращать пустую строку для null', () => {
      expect(serializeValue(null, true)).toBe('');
    });

    it('должен возвращать пустую строку для undefined', () => {
      expect(serializeValue(undefined, true)).toBe('');
    });

    it('должен работать так же для строк', () => {
      expect(serializeValue('hello', true)).toBe('hello');
    });

    it('должен работать так же для объектов', () => {
      const obj = { key: 'value' };
      expect(serializeValue(obj, true)).toBe('{"key":"value"}');
    });
  });
});
