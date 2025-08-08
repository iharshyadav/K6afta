import { Hono } from 'hono'
import { init } from './start.services'

const app = new Hono()

init();
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default {
  port : 3001,
  fetch : app.fetch
}
