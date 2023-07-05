// package.js <-- "type": "module" yes
import {ApolloServer, gql} from "apollo-server"
// package.js <-- "type": "module" no
// const {ApolloServer, gql} = require("apollo-server")

// whatever type query, user can be request
// GET /text <-- ok

// GET -> Query
// POST, PUT, DELETE -> Mutation
import fetch from "node-fetch"

let tweets = [
    {
      id: "1",
      text: "first one!",
      userId: "2",
    },
    {
      id: "2",
      text: "second one",
      userId: "1",
    },
];

let users = [
    {
      id: "1",
      firstName: "nico",
      lastName: "las",
    },
    {
      id: "2",
      firstName: "Elon",
      lastName: "Mask",
    },
  ];

const resolvers = {
    Query: {
        async allMovies() {
            const r = await fetch('https://yts.torrentbay.to/api/v2/list_movies.json');
            const json = await r.json();
            return json.data.movies;
        },
        allTweets() {
            return tweets;
        },
        tweet(root, {id}) {
            return tweets.find((tweet) => tweet.id === id);
        },
        allUsers() {
            return users;
        },
        async movie(__, {id}) {
            const r = await fetch(`https://yts.torrentbay.to/api/v2/movie_details.json?movie_id=${id}`);
            const json = await r.json();
            return json.data.movie;
        }
    },
    Mutation: {
        postTweet(__, {text, userId}) {
            // check userID exist.
            const writeUser = users.find((user) => user.id === userId);
            if(!writeUser) throw new Error(`There is no user with id ${userId}`);
            const newTweet = {
                id: tweets.length + 1,
                text,
                userId
            };
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(__, {id}) {
            const tweet = tweets.find((tweet) => tweet.id === id);
            if (!tweet) return false;
            tweets = tweets.filter((tweet) => tweet.id !== id);
            return true;
        }
    },
    User: {
        fullName({firstName, lastName}) {
            return `${firstName} ${lastName}`;
        }
    },
    Tweet: {
        author({userId}) {
            return users.find((user) => user.id === userId);
        }
    }
}

const typeDefs = gql`
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        """
        Is the sum of firstName + LastName with string.
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
    type Query {
        allMovies: [Movie!]!
        allUsers: [User!]!
        allTweets: [Tweet!]!
        tweet(id: ID!): Tweet
        movie(id: String!): Movie
    }
    type Mutation {
        postTweet(text: String!, userId: ID!): Tweet!
        """
        Delete Tweet if found else false.
        """
        deleteTweet(id: ID!): Boolean!
    }
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
    }
`;
//json to graphql type: https://transform.tools/json-to-graphql
//subscription type
//typescript schema
//hasura

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
    console.log(`Running on ${url}`);
});''