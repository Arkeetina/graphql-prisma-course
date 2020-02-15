import bcrypt from 'bcryptjs'
import { getUserId } from '../utils/getUserId'
import { hashPassword } from '../utils/hashPassword'
import { generateToken } from '../utils/tokenGenerator'

const Mutation = {
    async createUser(parent, args, { prisma }, info) {
        const password = await hashPassword(args.data.password)

        const user = prisma.mutation.createUser({ data: {
            ...args.data,
            password,
        } })

        return { user, token: generateToken(user.id) }
    },
    async updateUser(parent, { data }, { prisma, request }, info) {
        const userId = getUserId(request)

        if (typeof data.password === 'string') {
            data.password = await hashPassword(data.password)
        }

        return prisma.mutation
            .updateUser({ 
                data, 
                where: { id: userId }
            }, info)
    },
    async deleteUser(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)

        return prisma.mutation.deleteUser({ where: { id: userId } }, info)
  },
    createPost(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)

        return prisma.mutation.createPost({ data: {
            title: args.data.title,
            body: args.data.body,
            published: args.data.published,
            author: {
                connect: {
                    id: userId,
                }
            }
        }}, info)

    },
    async deletePost(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)
        const postExists = await prisma
            .exists.Post({ id: args.id, author: { id: userId }})
        
        if (!postExists) {
            throw new Error('Unable to delete post')
        }
        return prisma.mutation.deletePost({
            where: {
                id: args.id,
            }
        }, info)

    },
    async login(parent, { data }, { prisma }, info) {
        const user = await prisma.query.user({where: { email: data.email }})

        if (!user) {
            throw new Error('Unable to login')
        }
        
        const isMatch = await bcrypt.compare(data.password, user.password)
        if (!isMatch) {
            throw new Error('Unable to login')
        }

        return {
            user,
            token: generateToken(user.id)
        }
    },
    async updatePost(parent, { id, data }, { prisma, request }, info) {
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({
            id,
            author: { id: userId },
        })
        
        const isPublished = await prisma.exists.Post({
            id,
            published: true,
        })
        if (isPublished && !data.published) {
            await prisma.mutation.deleteManyComments({
                where: {
                    post: { id }
                }
            })
        }

        if (!postExists) {
            throw new Error('Undable to update post')
        }

        return prisma.mutation.updatePost({
            where: {
                id
            },
            data
        }, info)
    },
    async createComment(parent, args, { prisma, request }, info){
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({
            id: args.data.post,
            published: true,
        })

        if (!postExists) {
            throw new Error('Unable to find post')
        }
        return prisma.mutation.createComment({ data: {
            text: args.data.text,
            author: {
                connect: {
                    id: userId,
                }
            },
            post: {
                connect: {
                    id: args.data.post,
                }
            }
        }}, info)
    },
    async deleteComment(parent, args, { prisma, request }, info) {
        const userId = getUserId(request)
        const commentExists = await prisma.exists.Comment({
            id: args.id,
            author: { id: userId }
        })

        if(!commentExists) {
            throw new Error('Unnable to delete comment')
        }
    
        return prisma.mutation.deleteComment({
                where: {
                    id: args.id,
                }
            }, info)

    },
    async updateComment(parent, { id, data }, { prisma, request }, info) {
        const userId = getUserId(request)
        const commentExists = await prisma.exists.Comment({
            id: args.id,
            author: { id: userId }
        })

        if(!commentExists) {
            throw new Error('Unnable to update comment')
        }

        return prisma.mutation.updateComment({ 
                data,
                where: { id }
            }, info)
    },
}

export { Mutation as default }