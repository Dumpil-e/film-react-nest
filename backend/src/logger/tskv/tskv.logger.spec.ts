import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    stdoutSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    stderrSpy = jest
      .spyOn(process.stderr, 'write')
      .mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('должен быть определён', () => {
    expect(logger).toBeDefined();
  });

  describe('формат вывода и маршрутизация потоков', () => {
    it('должен выводить в stdout в строгом формате TSKV для log', () => {
      logger.log('Test message', 'TestContext');

      expect(stdoutSpy).toHaveBeenCalledTimes(1);
      expect(stderrSpy).not.toHaveBeenCalled();

      const output = stdoutSpy.mock.calls[0][0] as string;

      expect(output).toMatch(
        /^time=[^\t]+\tlevel=log\tmessage=Test message\tcontext=TestContext\n$/,
      );
    });

    it('должен выводить в stderr для error и добавлять stack', () => {
      logger.error('Error message', 'Stack trace', 'ErrorContext');

      expect(stderrSpy).toHaveBeenCalledTimes(1);
      expect(stdoutSpy).not.toHaveBeenCalled();

      const output = stderrSpy.mock.calls[0][0] as string;
      expect(output).toMatch(
        /^time=[^\t]+\tlevel=error\tmessage=Error message\tcontext=ErrorContext\tstack=Stack trace\n$/,
      );
    });

    it('должен маршрутизировать warn, debug, verbose в stdout и не использовать stderr', () => {
      logger.warn('Warn');
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('level=warn'),
      );
      expect(stderrSpy).not.toHaveBeenCalled();

      logger.debug('Debug');
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('level=debug'),
      );
      expect(stderrSpy).not.toHaveBeenCalled();

      logger.verbose('Verbose');
      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('level=verbose'),
      );
      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it('должен включать валидный ISO-формат в поле time', () => {
      logger.log('test');
      const output = stdoutSpy.mock.calls[0][0] as string;
      const match = output.match(/^time=([^\t]+)\t/);
      expect(match).toBeTruthy();
      const timestamp = match![1];
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('экранирование спецсимволов (критично для TSKV)', () => {
    it('должен экранировать табуляцию в значениях', () => {
      logger.log('Message\twith\ttabs');
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('message=Message\\twith\\ttabs');
    });

    it('должен экранировать переносы строк', () => {
      logger.log('Message\nwith\nnewlines');
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('message=Message\\nwith\\nnewlines');
    });

    it('должен экранировать обратный слэш', () => {
      logger.log('Message\\with\\backslashes');
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('message=Message\\\\with\\\\backslashes');
    });

    it('должен экранировать возврат каретки', () => {
      logger.log('Message\rwith\rcarriage');
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('message=Message\\rwith\\rcarriage');
    });

    it('должен экранировать стек', () => {
      logger.error('Error', 'Stack\nwith\tnewline\\and\\slash', 'Ctx');
      const output = stderrSpy.mock.calls[0][0] as string;
      expect(output).toContain('stack=Stack\\nwith\\tnewline\\\\and\\\\slash');
    });
  });

  describe('обработка null и undefined (treatNullAsEmpty = true)', () => {
    it('должен оставлять пустое значение после знака "=" для null', () => {
      logger.log(null as unknown as string, 'Ctx');
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('message=\tcontext=Ctx');
    });

    it('должен оставлять пустое значение для undefined', () => {
      logger.log(undefined as unknown as string, 'Ctx');
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('message=\tcontext=Ctx');
    });

    it('должен оставлять пустое значение для null и без контекста', () => {
      logger.log(null as unknown as string);
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toMatch(/message=\n$/);
    });
  });

  describe('опциональные поля и сериализация', () => {
    it('не должен добавлять поле context, если оно не передано', () => {
      logger.log('No context');
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).not.toContain('context=');
      expect(output).toMatch(/message=No context\n$/);
    });

    it('не должен добавлять поле stack, если оно не передано в error', () => {
      logger.error('No stack');
      const output = stderrSpy.mock.calls[0][0] as string;
      expect(output).not.toContain('stack=');
      expect(output).toMatch(/message=No stack\n$/);
    });

    it('должен сериализовать объекты в плоскую JSON-строку', () => {
      logger.log({ key: 'value', num: 42 });
      const output = stdoutSpy.mock.calls[0][0] as string;
      expect(output).toContain('message={"key":"value","num":42}');
    });

    it('должен добавлять stack, если он передан, даже без context', () => {
      logger.error('Error', 'stack line');
      const output = stderrSpy.mock.calls[0][0] as string;
      expect(output).toContain('stack=stack line');
      expect(output).not.toContain('context=');
    });
  });
});
