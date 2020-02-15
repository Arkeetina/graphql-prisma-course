import 'cross-fetch/polyfill'
import seedDatabase, { userOne, commentOne, commentTwo, postOne } from './utils/seedDatabase'
import getClient from './utils/getClient'
import prisma from '../src/prisma'
import { deleteComment, subscribeToComments } from './utils/operations'

const client = getClient()

beforeEach(seedDatabase)

test('Should delete own comment', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: commentTwo.comment.id
    }
    await client.mutate({ mutation: deleteComment, variables })
    const exists = await prisma.exists.Comment({ id: commentTwo.comment.id })

    expect(exists).toBe(false)
})

test('Should not delete other users comment', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: commentOne.comment.id
    }

    await expect(
        client.mutate({ mutation: deleteComment, variables })
    ).rejects.toThrow()
})

test('Should subscribe to comment for a post', async (done) => {
    const variables = {
        postId: postOne.post.id
    }

    client.subscribe({ query: subscribeToComments, variables }).subscribe({
        next(res) {
            expect(res.data.comment.mutation).toBe('DELETED')
            done()
        }
    })
    await prisma.mutation.deleteComment({ where: { id: commentOne.comment.id }})
}) 