import jwt from 'jsonwebtoken'

export const generateToken = (userId) => {
  return jwt.sign({ userId }, 'thissecret', { expiresIn: '30 days' })
}