const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const tableDataName = 'sampleData';

const getItemList = async (id) => {
  const param = {
    TableName: tableDataName,
  };
  const allData = await docClient.scan(param).promise();
  const body = {
    items: allData.Items.filter(_ => _.userID === id),
  };
  return buildResponse(200, body);
};

const createItem = async (reqBody) => {
  const param = {
    TableName: tableDataName,
    Item: reqBody,
  };
  return await docClient
    .put(param)
    .promise()
    .then(
      () => {
        const body = {
          operation: 'save',
          message: 'success',
          item: reqBody,
        };
        return buildResponse(200, body);
      },
      (error) => {
        console.log('error', error);
      }
    );
};

const loginUser = async (reqBody) => {
  const param = {
    TableName: 'users',
  };
  const allUsers = await docClient.scan(param).promise();
  let user = allUsers.Items.find(_ => _.email === reqBody.email && _.password === reqBody.password);
  if (user) {
    const body = {
      success: true,
      user: user,
    };
    return buildResponse(200, body);
  } else {
    return buildResponse(401, {
      success: false,
      user: {}
    })
  }

}

const buildResponse = (code, body) => {
  return {
    statusCode: code,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    },
    body: JSON.stringify(body),
  };
};

const deleteItem = async (id) => {
  const param = {
    TableName: tableDataName,
    Key: {
      id: id,
    },
    returnValues: 'ALL_OLD',
  };
  return await docClient
    .delete(param)
    .promise()
    .then(
      (response) => {
        const body = {
          operation: 'DELETE',
          message: 'success',
          item: response,
        };
        return buildResponse(200, body);
      },
      (error) => {
        console.log('error', error);
      }
    );
};

AWS.config.update({
  region: 'ca-central-1',
});

exports.handler = async (event) => {
  let response = {
    statusCode: 200,
    body: JSON.stringify('hI'),
  };


  switch (event.httpMethod) {
    case 'POST':
      if (event['resource'] === '/login') {
        response = await loginUser(JSON.parse(event.body));
      } else {
        response = await createItem(JSON.parse(event.body));
      }
      break;
    case 'DELETE':
      response = await deleteItem(JSON.parse(event.body).id);
      break;
    case 'PUT':
      response = {
        statusCode: 200,
        body: JSON.stringify('PUT'),
      };
      break;
    case 'GET':
      response = await getItemList(event['queryStringParameters']['id']);

      break;

    default:
    // code
  }
  return response;
};
