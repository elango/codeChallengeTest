import gql from 'graphql-tag'


export const getUserInfo = gql`
query getUserInfo($email:String){
  vet(email:$email) 
  {
    id,
    name,
    phone_number,
    photo_url
  }
} 
`;