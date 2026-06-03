import { sessionService } from '../../src/services/session.service';

const successResult = {
  stdout: 'ok',
  stderr: null,
  compile_output: null,
  status: { id: 3, description: 'Accepted' },
  time: '0.1',
  memory: 1024,
  success: true,
};

const failedResult = {
  stdout: null,
  stderr: 'NameError',
  compile_output: null,
  status: { id: 11, description: 'Runtime Error' },
  time: '0.1',
  memory: 1024,
  success: false,
};

describe('SessionService sandbox history', () => {
  it('uses only successful cells when building accumulated notebook context', async () => {
    const session = await sessionService.createSession({
      userId: 'user-1',
      sandboxType: 'hackathon',
      language: 'python',
    });

    await sessionService.addExecutionHistory(session.sessionId, {
      code: 'x = 10',
      language: 'python',
      result: successResult,
      cellIndex: 0,
    });
    await sessionService.addExecutionHistory(session.sessionId, {
      code: 'raise Exception("bad cell")',
      language: 'python',
      result: failedResult,
      cellIndex: 1,
    });
    await sessionService.addExecutionHistory(session.sessionId, {
      code: 'y = x + 5',
      language: 'python',
      result: successResult,
      cellIndex: 2,
    });

    const accumulated = await sessionService.getAccumulatedCode(session.sessionId);

    expect(accumulated).toContain('x = 10');
    expect(accumulated).toContain('y = x + 5');
    expect(accumulated).not.toContain('raise Exception');

    await sessionService.endSession(session.sessionId);
  });

  it('clears history and resets execution count when a sandbox session is restarted', async () => {
    const session = await sessionService.createSession({
      userId: 'user-2',
      sandboxType: 'hackathon',
      language: 'python',
    });

    await sessionService.addExecutionHistory(session.sessionId, {
      code: 'value = 1',
      language: 'python',
      result: successResult,
      cellIndex: 0,
    });

    await sessionService.clearExecutionHistory(session.sessionId);

    const history = await sessionService.getExecutionHistory(session.sessionId);
    const updatedSession = await sessionService.getSession(session.sessionId);

    expect(history).toEqual([]);
    expect(updatedSession?.executionCount).toBe(0);

    await sessionService.endSession(session.sessionId);
  });
});
