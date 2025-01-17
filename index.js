import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';
import { v4 as uuid } from 'uuid';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    enum Gender{
        NONE
        FICTION
        MISTERY
        FANTASY
        ROMANCE
    }

    type Author{
        name: String
        nationality: String
    }

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id: String!
    title: String!
    description: String
    isbn: String
    publisher: String!
    gender: Gender!
    publishYear: Int
    author: Author!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    getBooksCount: Int!
    getAllBooks: [Book]
    getBook(id: String): Book
    getAllBooksByAuthor(authorName: String): [Book]
  }

  type Mutation {
    addBook (
        title: String!
        description: String
        isbn: String
        publisher: String!
        gender: Gender!
        publishYear: Int
        authorName: String!
        authorNationality: String
    ): Book

    updateBook (
        id: String!
        title: String
        description: String
        isbn: String
        publisher: String
        gender: Gender
        publishYear: Int
        authorName: String
        authorNationality: String
    ): Book

    deleteBook (id: String!): Book
  }
`;

const books = [
    {
      id: '81529139-7370-4c9e-870d-8b4947897498',
      title: 'The Awakening',
      description : 'The Awakening es una novela...',
      publisher : 'W W Norton & Co Inc',
      gender : 'NONE',
      publishYear : 1899,
      authorName: 'Kate Chopin'

    },
    {
      id : '064d51b1-76a0-4ffe-995b-2f37ee4448ec',
      title: 'City of Glass',
      description : 'Ciudad de cristal...',
      isbn : '978-014009874552',
      publisher : 'Simon & Schuster',
      gender: 'FANTASY',
      publishYear : 2009,
      authorName: 'Paul Auster',
      authorNationality: 'Estadounidense'
    },
  ];

  // Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Book: {
        author: (root) => {
            return {
                name: root.authorName,
                nationality: root.authorNationality
            }
        }
    },

    Query: {
      getBooksCount: () => books.length,
      getAllBooks: () => books,
      getBook: (root, args) => {
        const {id} = args;
        return books.find(book => book.id === id);
      },
      getAllBooksByAuthor: (root, {authorName}) => books.filter(book => book.authorName === authorName)
    },

    Mutation: {
        addBook: (root, args) => {
            if (books.find(b => b.title === args.title)){
                throw new GraphQLError('Title must be unique', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }

            const newBook = {...args, id: uuid()};
            books.push(newBook);
            return newBook;
        },
        updateBook: (root, args) => {
            const updatedBookIndex = books.findIndex(book => book.id === args.id);

            if(updatedBookIndex === -1) return null;

            const book = books[updatedBookIndex];
            const updatedBook = {...book, 
            title: args.title ? args.title : book.title,
            description: args.description? args.description : book.description ,
            isbn: args.isbn? args.isbn : book.isbn,
            publisher: args.publisher? args.publisher : book.publisher,
            gender: args.gender? args.gender : book.gender,
            publishYear: args.publishYear? args.publishYear : book.publishYear,
            authorName: args.authorName? args.authorName : book.authorName,
            authorNationality: args.authorNationality? args.authorNationality : book.authorNationality
            };
            books[updatedBookIndex] = updatedBook;
            return updatedBook;
        },
        
        deleteBook: (root, {id}) => {
            const deletedBookIndex = books.findIndex(book => book.id === id);

            if(deletedBookIndex === -1) return null;

            const deletedBook = books.splice(deletedBookIndex, 1)[0];
            return deletedBook;
        }
    }

  };


  // The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  // Passing an ApolloServer instance to the `startStandaloneServer` function:
  //  1. creates an Express app
  //  2. installs your ApolloServer instance as middleware
  //  3. prepares your app to handle incoming requests
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  
  console.log(`🚀  Server ready at: ${url}`);