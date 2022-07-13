import {ApolloServer, gql} from "apollo-server";

//typeDefinition필요. - Query 타입은 필수적으로 써줘야함.
//typeDef는 mongoose의 schema와 비슷하게 데이터의 형식을 정하는 것. 

const typeDefs = gql` 
  type Query {
    text: String
    hello: String
  }
`;

//유저가 요청할 수 있는 data는 무조건 Query안에 넣어줘야함.
const server = new ApolloServer({typeDefs});

server.listen().then(({url}) => {
  console.log(`Running on ${url}`);
});