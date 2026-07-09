import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();

    // Перехватываем методы console, так как JsonLogger использует их напрямую
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(); // verbose использует info
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('должен быть определён', () => {
    expect(logger).toBeDefined();
  });

  describe('формат вывода и JSON-структура', () => {
    it('должен выводить валидный JSON с обязательными полями для log', () => {
      logger.log('Test message', 'TestContext');

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const output = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);

      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('level', 'log');
      expect(parsed).toHaveProperty('message', 'Test message');
      expect(parsed).toHaveProperty('context', 'TestContext');
    });

    it('должен использовать console.error для error и добавлять stack', () => {
      const stack = 'Error: test\n    at file.js:1:1';
      logger.error('Error message', stack, 'ErrorContext');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).not.toHaveBeenCalled();

      const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('Error message');
      expect(parsed.stack).toBe(stack);
      expect(parsed.context).toBe('ErrorContext');
    });

    it('должен использовать console.warn для warn', () => {
      logger.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('warn');
    });

    it('должен использовать console.debug для debug', () => {
      logger.debug('Debug message');
      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(consoleDebugSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('debug');
    });

    it('должен использовать console.info для verbose', () => {
      logger.verbose('Verbose message');
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
      const parsed = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(parsed.level).toBe('verbose');
    });
  });

  describe('сериализация значений (через serializeValue)', () => {
    it('должен корректно сериализовать объекты в строку JSON внутри поля message', () => {
      const obj = { key: 'value', num: 42 };
      logger.log(obj);

      const parsed = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      // safeStringify превращает объект в JSON-строку
      expect(parsed.message).toBe('{"key":"value","num":42}');
    });

    it('должен извлекать message из объекта Error', () => {
      const error = new Error('Something broke');
      logger.log(error);

      const parsed = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.message).toBe('Something broke');
    });

    it('должен конвертировать null в строку "null" (так как treatNullAsEmpty = false)', () => {
      logger.log(null as unknown as string);

      const parsed = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.message).toBe('null');
    });

    it('должен конвертировать undefined в строку "undefined"', () => {
      logger.log(undefined as unknown as string);

      const parsed = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(parsed.message).toBe('undefined');
    });

    it('не должен падать при circular references', () => {
      const obj: Record<string, unknown> = {};
      obj.self = obj;

      expect(() => logger.log(obj)).not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('опциональные поля', () => {
    it('не должен добавлять поле context, если оно не передано', () => {
      logger.log('No context');

      const parsed = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      expect(parsed).not.toHaveProperty('context');
    });

    it('не должен добавлять поле stack, если оно не передано в error', () => {
      logger.error('No stack');

      const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(parsed).not.toHaveProperty('stack');
    });
  });
});
