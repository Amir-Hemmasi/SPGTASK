const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const tableDataName = 'sampleData';
AWS.config.update({
  region: 'ca-central-1',
});

const dataWithPaging = (itemsPerPage, page, list) => {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return list.slice(startIndex, endIndex);
}

const getItemList = async (id, token, filterBy, page, itemPerPage) => {
  const usersParam = {
    TableName: 'users',
  };
  const allUsers = await docClient.scan(usersParam).promise();
  let user = allUsers.Items.find(_ => _.id === id && _.token === token);
  if (user === undefined) {
    return buildResponse(401, "Unauthorized");
  }
  if (filterBy === 'ALL') {

    const param = {
      TableName: tableDataName,
    };
    const allData = await docClient.scan(param).promise();
    const body = {
      items: dataWithPaging(itemPerPage ? itemPerPage : 10000, page ? page : 1, allData.Items.filter(_ => _.userID === id)),
    };
    return buildResponse(200, body);
  } else {
    const param = {
      TableName: tableDataName,
    };
    const allData = await docClient.scan(param).promise();
    const body = {
      items: dataWithPaging(itemPerPage ? itemPerPage : 10000, page ? page : 1, allData.Items.filter(_ => _.userID === id).map(_ => _[filterBy])),
    };
    return buildResponse(200, body);
  }
};

const createItem = async (reqBody) => {
  const param = {
    TableName: tableDataName,
    Item: reqBody.item,
  };
  const usersParam = {
    TableName: 'users',
  };
  const allUsers = await docClient.scan(usersParam).promise();
  let user = allUsers.Items.find(_ => _.id === reqBody.userID && _.token === reqBody.token);
  if (user === undefined) {
    return buildResponse(401, "Unauthorized");
  } else if (user.id !== reqBody.item.userID) {
    return buildResponse(401, "Unauthorized");
  }
  return await docClient
    .put(param)
    .promise()
    .then(
      () => {
        const body = {
          operation: 'save',
          message: 'success',
          item: reqBody.item,
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
  const token = tokenGenerator();

  if (user) {

    user.token = token;
    const param = {
      TableName: 'users',
      Item: user,
    };
    return await docClient
      .put(param)
      .promise()
      .then(
        () => {
          const body = {
            success: true,
            user: user,
            token
          };

          return buildResponse(200, body);
        },
        (error) => {
          return buildResponse(401, 'Login failed');
        }
      );
  } else {
    return buildResponse(401, {
      success: false,
      user: {},
      token: '',
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

const deleteItem = async (item, userID, token) => {
  const usersParam = {
    TableName: 'users',
  };
  const allUsers = await docClient.scan(usersParam).promise();
  let user = allUsers.Items.find(_ => _.id === userID && _.token === token);
  if (user === undefined) {
    return buildResponse(401, "Unauthorized");
  } else if (user.id !== userID) {
    return buildResponse(401, "Unauthorized");
  }
  const param = {
    TableName: tableDataName,
    Key: {
      id: item.id,
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
        return buildResponse(400, 'Operation failed');
      }
    );
};

const rand = () => {
  return Math.random().toString(36).substr(2);
};

const tokenGenerator = () => {
  return rand() + rand() + rand() + rand() + rand() + rand();
}



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
      response = await deleteItem(JSON.parse(event.body).item, JSON.parse(event.body).userID, JSON.parse(event.body).token);
      break;
    case 'PUT':
      response = {
        statusCode: 200,
        body: JSON.stringify('PUT'),
      };
      break;
    case 'GET':

      response = await getItemList(event['queryStringParameters']['userID'], event['queryStringParameters']['token'],
        event['queryStringParameters']['filterBy'], event['queryStringParameters']['page'], event['queryStringParameters']['itemPerPage']);

      break;

    default:
    // code
  }
  return response;
};
