import { Context } from 'aws-lambda'
import { handler, ddb } from '../../src/api/postGenerateCode'

jest.setTimeout(30e3)

const putItem = ddb.put

describe(`POST Generate Code`, () => {
  beforeEach(() => {
    ddb.put = jest.fn().mockImplementation((params) => {
      return {
        promise: () => Promise.resolve(true)
      }
    })
  })

  afterAll(() => {
    Object.assign(ddb, { put: putItem })
  })

  it('generates a code: success', async () => {
    const response = await handler(
      { body: JSON.stringify({ code_domain: 'ABC' }) },
      {} as Context,
      () => {}
    )

    const { item } = JSON.parse(response.body)
    expect(response.statusCode).toEqual(200)
    expect(item.code_domain).toEqual('ABC')
    expect(item.code_hash).toBeDefined()
  })

  it('creates a user-defined code: success', async () => {
    const response = await handler(
      { body: JSON.stringify({ code_domain: 'ABC', code_hash: 'testcode' }) },
      {} as Context,
      () => {}
    )

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'POST' // Allow only GET request
      },
      body: JSON.stringify({
        item: { code_domain: 'ABC', code_hash: 'testcode' }
      })
    })
  })

  it('creates a user-defined code: ddb put fail', async () => {
    ddb.put = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.reject({
            statusCode: 400,
            message: 'The conditional request failed'
          })
      }
    })

    const response = await handler(
      { body: JSON.stringify({ code_domain: 'ABC', code_hash: 'testcode' }) },
      {} as Context,
      () => {}
    )

    expect(response).toEqual({
      statusCode: 409,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'POST' // Allow only GET request
      },
      body: 'Record Already Exists'
    })
  })
})
