import { FastifyInstance } from "fastify"
import ShortUniqueId from "short-unique-id"
import { z } from "zod"
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate"


export async function poolRoutes(fastify: FastifyInstance) {
    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count()

        return { count }
    })

    fastify.post('/pools', async (request, reply) => {

        const createPoolBody = z.object({
            title: z.string(),

        })

        const { title } = createPoolBody.parse(request.body)

        const generate = new ShortUniqueId({ length: 6 })
        const code = String(generate()).toUpperCase()



        try {
            await request.jwtVerify()

            await prisma.pool.create({
                data: {
                    title,
                    code,
                    ownerId: request.user.sub,

                    participants: {
                        create: {
                            userId: request.user.sub,
                        }
                    }
                }
            })
        } catch {
            await prisma.pool.create({
                data: {
                    title,
                    code
                }
            })
        }


        return reply.status(201).send({ code })
    })

    fastify.post('/pools/:id/join', {
        onRequest: [authenticate]
    }, async (request, reply) => {
        const joinPoolBody = z.object({
            code: z.string(),
        })
        const { code } = joinPoolBody.parse(request.body)

        const pool = await prisma.pool.findUnique({
            where: {
                code,
            },
            include: {
                participants: {
                    where: {
                        userId: request.user.sub,
                    }
                }
            }
        })


        if (!pool) {
            return reply.status(400).send({
                message: 'Pool not found.'
            })
        }

        if (pool.participants.length > 0) {
            return reply.status(400).send({
                message: 'You already joined this pool.'
            })
        }
    })
}