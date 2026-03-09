import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';

export const organizationHandlers = [
  // GET /api/organizations/templates
  http.get(ApiUrl.organization + '/templates', () => {
    return HttpResponse.json({
      organizations: [
        {
          organization: '한앎',
          affiliation: '한양대',
          iconPath: '/icon/icon1.png',
          templates: [
            {
              name: '템플릿1',
              data: 'eJyrVspMUbIytjDXUcrMS8tXsqpWykvMTVWyUjJWKCtWMFZ427b1TXPj27YFrxcueN3T8HZWj8LbGVPfdM9V0lEqqSwAqXQODQ7x9%2FWMcgUKJaan5qUkAgWB7IKi%2FOKQ1MRcP4iBbzasedOyESienJ%2BHLP56wwygwUDx8sSivMy8dKfUnBwlq7TEnOJUHaW0zLzM4gwkoVqgtYlJOUCN0dVKxSWJeckgMwKC%2FIOBJhQXpKYmZ4RAnPVmXivQzUDRpPwKqJCff5Cvow%2FI5Zkgqw2NDICyYLPzSnNyIMIBqUUgx6EJBRekJmYDHQcTLgbxU4sg3FodJKc4%2B%2FsNFqf4uYaGBIEtQXPNhDdzFkCiFMVNIZ6%2BrvFOjsGuLnB3QazA6TBzkLMx3AX2DIkhtHXOm0WtCq83zHkzbQfdAwpr8qG7i2JrAbdLRw0%3D',
            },
            {
              name: '템플릿2',
              data: 'eJyrVspMUbIytjDXUcrMS8tXsqpWykvMTVWyUjJWKCtWMFZ427b1TXPj27YFrxcueN3T8HZWj8LbGVPfdM9V0lEqqSwAqXQODQ7x9%2FWMcgUKJaan5qUkAgWB7IKi%2FOKQ1MRcP4iBbzasedOyESienJ%2BHLP56wwygwUDx8sSivMy8dKfUnBwlq7TEnOJUHaW0zLzM4gwkoVqgtYlJOUCN0dVKxSWJeckgMwKC%2FIOBJhQXpKYmZ4RAnPVmXivQzUDRpPwKqJCff5Cvow%2FI5Zkgqw2NDICyYLPzSnNyIMIBqUUgx6EJBRekJmYDHQcTLgbxU4sg3FodJKc4%2B%2FsNFqf4uYaGBIEtQXPNhDdzFkCiFMVNIZ6%2BrvFOjsGuLnB3QazA6TBzkLMx3AX2DIkhtHXOm0WtCq83zHkzbQfdAwpr8qG7i2JrAbdLRw0%3D',
            },
          ],
        },
        {
          organization: '한모름',
          affiliation: '양한대',
          iconPath: '/icon/icon2.png',
          templates: [
            {
              name: '템플릿1',
              data: 'eJyrVspMUbIytjDXUcrMS8tXsqpWykvMTVWyUjJWKCtWMFZ427b1TXPj27YFrxcueN3T8HZWj8LbGVPfdM9V0lEqqSwAqXQODQ7x9%2FWMcgUKJaan5qUkAgWB7IKi%2FOKQ1MRcP4iBbzasedOyESienJ%2BHLP56wwygwUDx8sSivMy8dKfUnBwlq7TEnOJUHaW0zLzM4gwkoVqgtYlJOUCN0dVKxSWJeckgMwKC%2FIOBJhQXpKYmZ4RAnPVmXivQzUDRpPwKqJCff5Cvow%2FI5Zkgqw2NDICyYLPzSnNyIMIBqUUgx6EJBRekJmYDHQcTLgbxU4sg3FodJKc4%2B%2FsNFqf4uYaGBIEtQXPNhDdzFkCiFMVNIZ6%2BrvFOjsGuLnB3QazA6TBzkLMx3AX2DIkhtHXOm0WtCq83zHkzbQfdAwpr8qG7i2JrAbdLRw0%3D',
            },
            {
              name: '템플릿2',
              data: 'eJyrVspMUbIytjDXUcrMS8tXsqpWykvMTVWyUjJWKCtWMFZ427b1TXPj27YFrxcueN3T8HZWj8LbGVPfdM9V0lEqqSwAqXQODQ7x9%2FWMcgUKJaan5qUkAgWB7IKi%2FOKQ1MRcP4iBbzasedOyESienJ%2BHLP56wwygwUDx8sSivMy8dKfUnBwlq7TEnOJUHaW0zLzM4gwkoVqgtYlJOUCN0dVKxSWJeckgMwKC%2FIOBJhQXpKYmZ4RAnPVmXivQzUDRpPwKqJCff5Cvow%2FI5Zkgqw2NDICyYLPzSnNyIMIBqUUgx6EJBRekJmYDHQcTLgbxU4sg3FodJKc4%2B%2FsNFqf4uYaGBIEtQXPNhDdzFkCiFMVNIZ6%2BrvFOjsGuLnB3QazA6TBzkLMx3AX2DIkhtHXOm0WtCq83zHkzbQfdAwpr8qG7i2JrAbdLRw0%3D',
            },
          ],
        },
      ],
    });
  }),
];
