// @flow

import insomniaTesting from 'insomnia-testing';
import { runInsomniaTests, TestReporterEnum } from '../run-tests';
import os from 'os';
import type { RunTestsOptions } from '../run-tests';

jest.mock('insomnia-testing');
jest.mock('os');
jest.mock('console');

describe('runInsomniaTests()', () => {
  // make flow happy
  const mock = (mockFn: any) => mockFn;
  beforeEach(() => {
    mock(os.tmpdir).mockReturnValue('/tmpDir');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const base: RunTestsOptions = {
    reporter: TestReporterEnum.spec,
  };

  it('should should not generate if type arg is invalid', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await runInsomniaTests(({ reporter: 'invalid' }: Object));

    expect(insomniaTesting.runTestsCli).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Reporter "invalid" not unrecognized. Options are [dot, list, spec, min, progress].',
    );
  });

  it('should forward options to insomnia-testing', async () => {
    const contents = 'generated test contents';
    mock(insomniaTesting.generate).mockResolvedValue(contents);

    const options = { ...base, reporter: 'min', bail: true };
    await runInsomniaTests(options);

    expect(insomniaTesting.runTestsCli).toHaveBeenCalledWith(contents, options);
  });
});