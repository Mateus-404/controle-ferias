import requestRoutes from './request.js'
import userRoutes from './users.js'

export default async function routes(server) {
  server.register(requestRoutes, { prefix: '/requests' })
  server.register(userRoutes, { prefix: '/users' })
}
