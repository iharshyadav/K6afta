import { Hono } from 'hono'
import { init } from './start.services'

// routes
import postRoutes from './services/create-post'

const app = new Hono()

init();

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/',postRoutes);

export default app
