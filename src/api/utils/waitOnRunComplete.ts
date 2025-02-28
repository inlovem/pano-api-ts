
export async function waitOnRunCompletion(
    openai: any,
    runId: string,
    threadId: string
  ): Promise<string> {
    let runStatus = 'queued';
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      try {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId);
        runStatus = run.status;
        if (runStatus === 'queued' || runStatus === 'in_progress') {
          // Wait 500ms before polling again
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error('Error retrieving run status:', error);
        throw new Error('Failed to retrieve run status');
      }
    }
    return runStatus;
  }