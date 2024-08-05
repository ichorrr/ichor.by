import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useApolloClient, gql } from '@apollo/client';

import UserForm from '../components/UserForm'
import BgShader from '../components/BackShader'


const SIGNUP_USER = gql`mutation signUp($name: String!, $email: String!, $password: String!){
  signUp(name: $name, email: $email, password: $password)
}`;
import {GET_USER, GET_ME} from '../gql/query';
const SignUp = props => {
let navigate = useNavigate();
const [values, setValues] = useState();

const onChange = event => {
  setValues({
    ...values,
    [event.target.name]: event.target.value
  });
};

  useEffect(() => {
    document.title = 'Sign Up > ICHOR.BY aplication development';
  });

  const [signUp, { loading, error, refetch, networkStatus  }] = useMutation(SIGNUP_USER, {

    refetchQueries: [{query: GET_USER}, {query: GET_ME}],
    onCompleted: data => {
      localStorage.setItem('token', data.signUp);
      window.location.replace('/');
    }
  });
  if (loading) return (
    <div className="loading-signinup">
      <p>loading...</p>
    </div>)
if (error) return (
<>
<div className="css-userform">
<div className="up err-message">
  <h3>{error.message}</h3>
  <span>incorrect email or password</span>
  </div>
    <UserForm action={signUp} formType="signUp" />
  </div>
  <BgShader />
</>
)
  return (
    <>
    <div className="css-userform">
      <UserForm action={signUp} formType="signUp" />
    </div>
    <BgShader />
    </>
  );
};

export default SignUp;
