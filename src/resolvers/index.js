import { extractFragmentReplacements } from 'prisma-binding'

import Query from './Query'
import Mutation from './Mutation'
import Post from './Post'
import Comment from './Comment'
import Subscription from './Subscription'
import User from './User'

export const resolvers = {
  Query,
  Mutation,
  Post,
  Subscription,
  Comment,
  User,
}

export const fragmentReplacements = extractFragmentReplacements(resolvers);
