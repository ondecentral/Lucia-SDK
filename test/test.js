import Lucia from './bundle-b2.js'

const lucia = new Lucia({
  clientId: 'ak',
  baseURL: 'http://localhost:3000',
  api_key: '2fae3576-7c822d0c-32a344ed-ad7f08b5-4ea1c046-3f8500ea-b30fa583-bd98e35f'
})

const status = lucia.authenticate();

lucia.userInfo('userX')
lucia.pageView('welcome')