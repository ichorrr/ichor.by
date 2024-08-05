import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, InMemoryCache, writeQuery, useQuery, useApolloClient, NetworkStatus, gql } from '@apollo/client';

import UserForm from '../components/UserForm';
import BgShader from '../components/BackShader'
const cache = new InMemoryCache();
const SIGNIN_USER = gql`mutation signIn($email: String!, $password: String!){
  signIn(email: $email, password: $password)
}`;

const SignIn = props => {
  useEffect(() => {
    // update the document title
    document.title = 'Sign In > ICHOR.BY aplication development';
  });
  const navigate = useNavigate();

  const [signIn, { data, loading, error, refetch, networkStatus }] = useMutation(SIGNIN_USER, {
    onCompleted: data => {
      // store the token
      localStorage.setItem('token', data.signIn);
      notifyOnNetworkStatusChange: true;
      fetchPolicy: "no-cache";
      window.location.replace('/');

    }});
  if (networkStatus === NetworkStatus.refetch)
      return <p>re-query execution...</p>
      if (loading) return (
        <div className="loading-signinup">
          <p>loading...</p>
        </div>)
  if (error) return (
    <>
    <div className="css-userform">
    <div className="err-message">
      <h3>{error.message}</h3>
      <span>incorrect email or password</span>
    </div>
      <UserForm action={signIn} formType="signIn" />
    </div>
    <BgShader />
    </>
  )
  return (
    <>
    <div className="css-userform">
      <UserForm action={signIn} formType="signIn" />
    </div>
    <BgShader />
    </>
  );
};

export default SignIn;
