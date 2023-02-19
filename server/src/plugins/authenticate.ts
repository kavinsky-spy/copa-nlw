import { FastifyRequest } from "fastify";

export async function authenticate(request: FastifyInstance) {
    await request.jwtVerify()
}