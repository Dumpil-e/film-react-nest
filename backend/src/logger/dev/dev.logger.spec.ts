import { DevLogger } from './dev.logger';

describe('DevLogger', () => {
  let logger: DevLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;
  let originalIsTTY: boolean | undefined;

  beforeEach(() => {
    logger = new DevLogger();

    stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    stderrSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);

    // Включаем TTY для проверки цветов
    originalIsTTY = process.stdout.isTTY;
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    Object.defineProperty(process.stdout, 'isTTY', {
      value: originalIsTTY,
      configurable: true,
    });
  });

  it('должен быть определён', () => {
    expect(logger).toBeDefined();
  });

  it('должен наследоваться от ConsoleLogger и иметь все методы', () => {
    expect(typeof logger.log).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.verbose).toBe('function');
  });

  describe('метод log', () => {
    it('должен писать в stdout с сообщением и контекстом и не трогать stderr', () => {
      logger.log('Тестовое сообщение', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('Тестовое сообщение'),
      );
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('TestContext'),
      );
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('должен обрабатывать объекты, выводя их содержимое', () => {
      const obj = { key: 'value', nested: { foo: 'bar' } };
      logger.log(obj, 'Context');

      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('value'));
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('bar'));
    });

    it('должен обрабатывать ошибки (извлекать message)', () => {
      const error = new Error('Something went wrong');
      logger.log(error);

      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('Something went wrong'),
      );
    });

    it('не должен падать при передаче null или undefined', () => {
      expect(() => logger.log(null as unknown as string)).not.toThrow();
      expect(() => logger.log(undefined as unknown as string)).not.toThrow();
    });
  });

  describe('метод error', () => {
    it('должен писать в stderr с сообщением, стеком и контекстом и не трогать stdout', () => {
      const stack = 'Error: something\n    at test.js:10:5';
      logger.error('Ошибка', stack, 'TestContext');
      expect(stderrSpy).toHaveBeenCalledTimes(2);
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('Ошибка'));
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining(stack));
      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('TestContext'),
      );
      expect(stdoutSpy).not.toHaveBeenCalled();
    });

    it('должен работать без стека и контекста', () => {
      logger.error('Просто ошибка');
      expect(stderrSpy).toHaveBeenCalledTimes(1);
      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('Просто ошибка'),
      );
    });

    it('должен обрабатывать объекты в сообщении', () => {
      logger.error({ code: 500, message: 'Internal' }, 'stack');
      expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('500'));
      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('Internal'),
      );
    });

    it('должен извлекать стек из переданного объекта Error', () => {
      const error = new Error('Test error');
      logger.error(error, undefined, 'Context');

      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error'),
      );
      expect(stderrSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error: Test error'),
      );
    });

    it('не должен падать при передаче null в стек или контекст', () => {
      expect(() =>
        logger.error(
          'Ошибка',
          null as unknown as string,
          null as unknown as string,
        ),
      ).not.toThrow();
    });
  });

  describe('метод warn', () => {
    it('должен писать в stdout с сообщением и контекстом, не трогая stderr', () => {
      logger.warn('Предупреждение', 'WarnContext');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('Предупреждение'),
      );
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('WarnContext'),
      );
      expect(stderrSpy).not.toHaveBeenCalled();
    });
  });

  describe('метод debug', () => {
    it('должен писать в stdout с сообщением и контекстом, не трогая stderr', () => {
      logger.debug('Debug сообщение', 'DebugContext');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('Debug сообщение'),
      );
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('DebugContext'),
      );
      expect(stderrSpy).not.toHaveBeenCalled();
    });
  });

  describe('метод verbose', () => {
    it('должен писать в stdout с сообщением и контекстом, не трогая stderr', () => {
      logger.verbose('Verbose сообщение', 'VerboseContext');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('Verbose сообщение'),
      );
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('VerboseContext'),
      );
      expect(stderrSpy).not.toHaveBeenCalled();
    });
  });

  describe('цветовое форматирование', () => {
    it('должен добавлять ANSI-коды для цветов (так как isTTY = true)', () => {
      logger.log('Цветной текст');
      const call = stdoutSpy.mock.calls[0][0] as string;

      expect(call).toMatch(/\x1b\[[0-9;]*m/);
    });
  });
});
