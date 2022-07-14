import {ApolloServer, gql} from "apollo-server";

const tweets = [
  {
    id: "1",
    text: "first tweet",
  },
  {
    id: "2",
    text: "second tweet",
  },
  {
    id: "3",
    text: "third tweet",
  }
];

//typeDefinition필요. - Query 타입은 필수적으로 써줘야함.
//typeDef는 mongoose의 schema와 비슷하게 데이터의 형식을 정하는 것. 
const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    firstName: String!
    lastName: String!
  }
  type Tweet {
    id: ID!
    text: String!
    author: User
  }
  type Query {
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet
    deleteTweet(id: ID!): Boolean!
  }
`;
// [Tweet]은 allTweets이 여러개의 Tweet 을 가지는 것.
// author: User은 하나의 User와 연결된다는 것.
//Schema Definition language는 직관적.
//tweet(id: ID)는 request할 때 id도 같이 보내줘야함. 그래야 어떤 tweet인지 특정가능.
//Query 안에 넣는 것은  restAPI에서 GET api를 만드는 것과 같다. = DB에 아무영향 X

//유저가 요청할 수 있는 data는 무조건 Query안에 넣어줘야함.
//유저가 데이터/서버/캐시 등에 변화를 일으키는 요청들은 모두 Mutation에 넣어줘야함 - POST, DELETE, PUT ....

//! 느낌표를 붙여주면 해당 필드는 null일 수 없다.
//매개변수에 느낌표를 붙여주면 무조건 매개변수와 함께 요청이 이루어져야한다.
//느낌표가 없으면 nullable 필드이다.
//[Tweet!]! : 무조건 array를 돌려주는데, 해당 어레이는 하나 이상의 Tweet이 들어있다.
//요청의 결과가 무조건 주어진다면(null이 아니라면) 느낌표를 붙여주자.

// request가 될 때 실행되는 함수들
const resolvers = {
  Query: {
    allTweets() {
      return tweets;
    },//allTweets을 요청할 때 tweets을 리턴해준다.
    tweet(root, {id}) { //첫번째 resolver함수의 매개변수는 무조건 root. 요청할 때 넘겨받는 매개변수는 두번째.
      console.log(`${id}에 해당하는 트윗찾기`)
      return tweets.find(tweet => tweet.id === id);
    },
  },
}

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
  console.log(`Running on ${url}`);
});