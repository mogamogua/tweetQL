import {ApolloServer, gql} from "apollo-server";
import fetch from "node-fetch";

let tweets = [
  {
    id: "1",
    text: "first tweet",
    userId: "2",
  },
  {
    id: "2",
    text: "second tweet",
    userId: "2",
  },
  {
    id: "3",
    text: "third tweet",
    userId: "1",
  },
];

let users = [
  {
    id: "1",
    firstName: "Jisu",
    lastName: "Kim",
  },
  {
    id: "2",
    firstName: "meong",
    lastName: "nyang",
  },
]

//typeDefinition필요. - Query 타입은 필수적으로 써줘야함.
//typeDef는 mongoose의 schema와 비슷하게 데이터의 형식을 정하는 것. 
// """ """ 안에 type에 대한 description을 손쉽게 추가할 수 있다.
const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    """
    fullName is sum of firstName and lastName.
    """
    fullName: String!
  }
  """
  Tweet object represents a resource for a Tweet.
  """
  type Tweet {
    id: ID!
    text: String!
    author: User
  }
  type Movie {
    id: Int!
    url: String
    imdb_code: String!
    title: String
    title_english: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String
    background_image_original: String
    small_cover_image: String
    medium_cover_image: String
    large_cover_image: String
  }
  type Query {
    allMovies: [Movie]
    movie(id: String!): Movie!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    allUsers: [User!]!
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet
    """
    delete a tweet that has same id given to request.
    """
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
    allTweets() { //함수 이름은 type과 동일해야한다.
      return tweets;
    },//allTweets을 요청할 때 tweets을 리턴해준다.
    tweet(root, {id}) { //첫번째 resolver함수의 매개변수는 무조건 root. 요청할 때 넘겨받는 매개변수는 두번째.
      console.log(`${id}에 해당하는 트윗찾기`)
      return tweets.find(tweet => tweet.id === id);
    },
    allUsers() {
      console.log("all Users are called")
      return users;
    },
    //restAPI를 graphQL로 감싸기.
    //스키마 작성후, data를 가져와서 넘겨주면된다.
    allMovies() {
      return fetch("https://yts.mx/api/v2/list_movies.json")
        .then((response) => response.json())
        .then((json) => json.data.movies);
    },
    movie(_, {id}) {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((response) => response.json())
        .then((json) => json.data.movie);
    },
  },
  Mutation: { //data를 수정하는 요청 시 실행될 함수들
    postTweet(_, {text, userId}) {
      const newTweet = {
        id : tweets.length+1,
        text,
        userId,
      }
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(_, {id}) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  //type resolver
  User: { //특정 필드를 다이내믹필드로 만들 수 있다.
     //data에는 fullName필드가 없으므로 graphQL은 User의 fullName resolver로 해당 data를 찾는다.
     fullName({firstName, lastName}) {
      return `${firstName} ${lastName}`;
    },
  },
  Tweet: {
    //Tweet과 User연결하기
    //author라는 필드를 만들어준다.
    author({userId}) {
      const user = users.find((user) => user.id === userId);
      if (!user) return null;
      return user;
    }
  }
};

// {
//   allTweets {
//     id,
//     text,
//     author { 이렇게 tweet과 연결된 user를 불러올 수 있다.
//       id,
//       fullName
//     }
//   }
// }

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => {
  console.log(`Running on ${url}`);
});