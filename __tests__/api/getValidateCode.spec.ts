import { Context } from 'aws-lambda'
import { handler, ddb } from '../../src/api/getValidateCode'

jest.setTimeout(30e3)

const getItem = ddb.get

describe(`GET Validate Code`, () => {
  beforeEach(() => {
    ddb.get = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.resolve({
            Item: { code_domain: 'ABC', code_hash: 'testcode' }
          })
      }
    })
  })

  afterAll(() => {
    Object.assign(ddb, { get: getItem })
  })

  it('gets a validation of the code: success', async () => {
    const response = await handler(
      { pathParameters: { code_domain: 'ABC', code_hash: 'testcode' } },
      {} as Context,
      () => {}
    )

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'GET' // Allow only GET request
      },
      body: JSON.stringify({
        item: { code_domain: 'ABC', code_hash: 'testcode' }
      })
    })
  })

  it('gets a validation of the code: ddb fail', async () => {
    ddb.get = jest.fn().mockImplementation((params) => {
      return {
        promise: () => Promise.reject('not found')
      }
    })

    const response = await handler(
      { pathParameters: { code_domain: 'ABC', code_hash: 'testcode' } },
      {} as Context,
      () => {}
    )

    expect(response).toEqual({
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'GET' // Allow only GET request
      },
      body: 'Record Not Found'
    })
  })

  it('gets a validation of the code: not found', async () => {
    ddb.get = jest.fn().mockImplementation((params) => {
      return {
        promise: () => Promise.resolve({})
      }
    })

    const response = await handler(
      { pathParameters: { code_domain: 'ABC', code_hash: 'testcode' } },
      {} as Context,
      () => {}
    )

    expect(response).toEqual({
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // Allow from anywhere
        'Access-Control-Allow-Methods': 'GET' // Allow only GET request
      },
      body: 'Record Not Found'
    })
  })
})
