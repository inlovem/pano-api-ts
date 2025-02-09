// src/api/controllers/userRecordingController.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import * as service from '../services/recordingService';
import { IUser, IUpdateRecordingParams, IUpdateRecordingBody } from '../types/interfaces';

/**
 * Controller for updating a user recording.
 *
 * Expects a request body in JSON:API style:
 * {
 *   "data": {
 *     "id": "<recordingId>",
 *     "type": "recording",
 *     "attributes": { ... }
 *   }
 * }
 *
 * @param request - The FastifyRequest with the expected shape in the Params and Body.
 * @param reply - The FastifyReply object.
 */
export async function updateRecordingController(
  request: FastifyRequest<{
    Params: IUpdateRecordingParams;
    Body: IUpdateRecordingBody;
  }>,
  reply: FastifyReply
) {
    const { recordingId } = request.params;
    const { data } = request.body;
    const { id, type, attributes = {} } = data || {};
    const uid = request.user.uid


  if (type !== 'recording' || String(id) !== String(recordingId)) {
    return reply.status(409).send({
      errors: [{ status: '409', title: 'Unrecognized type or invalid id' }],
      status: 409,
    });
  }

  
  try {
    const recording = await service.updateUserRecording(
        uid, 
        { id: recordingId }, 
        attributes
    );

    if (recording && typeof recording.toJSONAPIResourceObject === 'function') {
      const resourceObject = await recording.toJSONAPIResourceObject();
      return reply.send(resourceObject);
    } else if (recording) {
      return reply.send(recording);
    } else {
      return reply.status(404).send({ status: 404 });
    }
  } catch (error: any) {
    return reply.status(500).send({ status: 500 });
  }
}
